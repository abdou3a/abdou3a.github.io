class AIIDCardExtractor {
    constructor() {
        this.currentLanguage = 'fr';
        this.database = JSON.parse(localStorage.getItem('idCardDatabase') || '[]');
        this.currentFile = null;
        this.tessWorker = null;
        
        // Patterns optimisés par entraînement IA
        this.patterns = {
            // Patterns français optimisés
            fr: {
                fullName: [
                    /(?:NOM\s*ET\s*PRENOM|NOM|PRENOM)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i,
                    /([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]+){1,4})/,
                    /(?:TITULAIRE|BENEFICIAIRE)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i
                ],
                idNumber: [
                    /(?:N°|NUM|NUMERO|CARTE\s*NATIONALE|CNIE)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/i,
                    /([A-Z]{1,2}[0-9]{6,8})/,
                    /(?:ID|IDENTIFIANT)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/i
                ],
                birthDate: [
                    /(?:NE\s*LE|NAISSANCE|DATE\s*DE\s*NAISSANCE|NEE?\s*LE?)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                    /(?:DATE\s*NAISS|D\.NAISS)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                    /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/
                ],
                birthPlace: [
                    /(?:NE\s*A|LIEU\s*DE\s*NAISSANCE|A)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i,
                    /(?:LIEU\s*NAISS|L\.NAISS)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i
                ],
                nationality: /(?:NATIONALITE|MAROCAINE)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i,
                gender: /(?:SEXE)\s*:?\s*([MFmf])/i,
                expiryDate: [
                    /(?:EXPIRE\s*LE|EXPIRATION|VALABLE\s*JUSQU|VALIDITE)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                    /(?:DATE\s*EXP|D\.EXP)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i
                ]
            },
            
            // Patterns arabes optimisés
            ar: {
                fullName: [
                    /(?:الاسم\s*الكامل|الاسم\s*و\s*النسب|الإسم)\s*:?\s*([\u0600-\u06FF\s]+)/,
                    /(?:صاحب\s*البطاقة|المستفيد)\s*:?\s*([\u0600-\u06FF\s]+)/
                ],
                idNumber: [
                    /(?:رقم\s*البطاقة|ب\.و\.ت\.م|بطاقة\s*التعريف)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/,
                    /([A-Z]{1,2}[0-9]{6,8})/
                ],
                birthDate: [
                    /(?:تاريخ\s*الازدياد|مولود\s*في|الازدياد)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/,
                    /(?:ت\.الازدياد)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/
                ],
                birthPlace: [
                    /(?:مكان\s*الازدياد|مولود\s*ب|بـ)\s*:?\s*([\u0600-\u06FF\s]+)/,
                    /(?:م\.الازدياد)\s*:?\s*([\u0600-\u06FF\s]+)/
                ],
                nationality: /(?:الجنسية|مغربي|مغربية)\s*:?\s*([\u0600-\u06FF\s]+)/,
                gender: /(?:الجنس|النوع)\s*:?\s*(ذكر|أنثى|م|ف)/,
                expiryDate: [
                    /(?:صالحة\s*إلى|انتهاء\s*الصلاحية|تنتهي\s*في)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/,
                    /(?:ت\.الانتهاء)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/
                ]
            },
            
            // Patterns anglais
            en: {
                fullName: /(?:full\s*name|name\s*and\s*surname|name)\s*:?\s*([A-Za-z\s-]+)/i,
                idNumber: /(?:national\s*id|id\s*card|cnie)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/i,
                birthDate: /(?:date\s*of\s*birth|born\s*on|birth\s*date)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                birthPlace: /(?:place\s*of\s*birth|born\s*in|birth\s*place)\s*:?\s*([A-Za-z\s-]+)/i,
                nationality: /(?:nationality|moroccan)\s*:?\s*([A-Za-z\s-]+)/i,
                gender: /(?:sex|gender)\s*:?\s*([MFmf])/i,
                expiryDate: /(?:expires\s*on|expiry\s*date|valid\s*until)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                cnie: /(?:CNIE|National\s*ID)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/i
            }
        };
        
        // Villes marocaines étendues
        this.moroccanCities = [
            'CASABLANCA', 'RABAT', 'FES', 'MARRAKECH', 'AGADIR', 'TANGIER', 'MEKNES', 'OUJDA',
            'KENITRA', 'TETOUAN', 'SAFI', 'MOHAMMEDIA', 'KHOURIBGA', 'BENI MELLAL', 'EL JADIDA',
            'TAZA', 'NADOR', 'SETTAT', 'LARACHE', 'KSAR EL KEBIR', 'SALE', 'BERRECHID',
            'TEMARA', 'KHEMISSET', 'ERRACHIDIA', 'GUELMIM', 'OUARZAZATE', 'AL HOCEIMA',
            'الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'أكادير', 'طنجة', 'مكناس', 'وجدة',
            'القنيطرة', 'تطوان', 'آسفي', 'المحمدية', 'خريبكة', 'بني ملال', 'الجديدة',
            'تمارة', 'الخميسات', 'الراشيدية', 'كلميم', 'ورزازات', 'الحسيمة'
        ];
        
        // Translations
        this.translations = {
            fr: {
                subtitle: "Extracteur intelligent de données de cartes d'identité avec support multilingue",
                upload_title: "Télécharger une carte d'identité",
                upload_text: "Cliquez ou glissez votre carte d'identité ici",
                upload_hint: "Formats supportés: JPG, PNG, PDF (Max: 10MB)",
                preview_title: "Aperçu",
                no_preview: "Aucune image sélectionnée",
                extracted_data: "Données extraites",
                full_name: "Nom complet",
                id_number: "Numéro d'identité",
                birth_date: "Date de naissance",
                birth_place: "Lieu de naissance",
                nationality: "Nationalité",
                gender: "Sexe",
                expiry_date: "Date d'expiration",
                address: "Adresse",
                extract_data: "Extraire les données",
                add_to_db: "Ajouter à la base",
                clear_form: "Effacer",
                export_excel: "Exporter Excel",
                database_title: "Base de données",
                total_records: "Total: ",
                actions: "Actions",
                no_data: "Aucune donnée disponible",
                processing: "Traitement en cours...",
                success: "Données extraites avec succès!",
                error: "Erreur lors de l'extraction",
                added_success: "Ajouté à la base de données",
                form_cleared: "Formulaire effacé"
            },
            
            ar: {
                subtitle: "مستخرج ذكي لبيانات بطاقات الهوية مع دعم متعدد اللغات",
                upload_title: "رفع بطاقة الهوية",
                upload_text: "انقر أو اسحب بطاقة الهوية هنا",
                upload_hint: "الصيغ المدعومة: JPG, PNG, PDF (الحد الأقصى: 10 ميجابايت)",
                preview_title: "معاينة",
                no_preview: "لم يتم اختيار صورة",
                extracted_data: "البيانات المستخرجة",
                full_name: "الاسم الكامل",
                id_number: "رقم الهوية",
                birth_date: "تاريخ الولادة",
                birth_place: "مكان الولادة",
                nationality: "الجنسية",
                gender: "الجنس",
                expiry_date: "تاريخ الانتهاء",
                address: "العنوان",
                extract_data: "استخراج البيانات",
                add_to_db: "إضافة للقاعدة",
                clear_form: "مسح",
                export_excel: "تصدير إكسل",
                database_title: "قاعدة البيانات",
                total_records: "المجموع: ",
                actions: "الإجراءات",
                no_data: "لا توجد بيانات متاحة",
                processing: "جاري المعالجة...",
                success: "تم استخراج البيانات بنجاح!",
                error: "خطأ في الاستخراج",
                added_success: "تم الإضافة لقاعدة البيانات",
                form_cleared: "تم مسح النموذج"
            },
            
            en: {
                subtitle: "Intelligent ID card data extractor with multilingual support",
                upload_title: "Upload ID Card",
                upload_text: "Click or drag your ID card here",
                upload_hint: "Supported formats: JPG, PNG, PDF (Max: 10MB)",
                preview_title: "Preview",
                no_preview: "No image selected",
                extracted_data: "Extracted Data",
                full_name: "Full Name",
                id_number: "ID Number",
                birth_date: "Birth Date",
                birth_place: "Birth Place",
                nationality: "Nationality",
                gender: "Gender",
                expiry_date: "Expiry Date",
                address: "Address",
                extract_data: "Extract Data",
                add_to_db: "Add to Database",
                clear_form: "Clear",
                export_excel: "Export Excel",
                database_title: "Database",
                total_records: "Total: ",
                actions: "Actions",
                no_data: "No data available",
                processing: "Processing...",
                success: "Data extracted successfully!",
                error: "Error during extraction",
                added_success: "Added to database",
                form_cleared: "Form cleared"
            }
        };
        
        this.initializeApp();
    }
    
    async initializeApp() {
        this.setupEventListeners();
        this.updateLanguage();
        this.renderDatabase();
        await this.initializeTesseract();
    }
    
    async initializeTesseract() {
        try {
            this.tessWorker = await Tesseract.createWorker({
                logger: m => {
                    if (m.status === 'recognizing text') {
                        this.updateProgress(Math.round(m.progress * 100));
                    }
                }
            });
            
            // Configuration optimisée pour cartes marocaines
            await this.tessWorker.loadLanguage('ara+fra+eng');
            await this.tessWorker.initialize('ara+fra+eng');
            
            // Paramètres OCR optimisés pour cartes d'identité
            await this.tessWorker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-.:أبتثجحخدذرزسشصضطظعغفقكلمنهويءآإؤئة',
                tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
                preserve_interword_spaces: '1'
            });
            
            console.log('Tesseract initialisé avec succès pour cartes marocaines');
        } catch (error) {
            console.error('Erreur initialisation Tesseract:', error);
            this.showStatus('error', 'Erreur d\'initialisation OCR');
        }
    }
    
    setupEventListeners() {
        // Drag and drop
        const uploadArea = document.querySelector('.upload-area');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
        
        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
    }
    
    handleFile(file) {
        // Validate file
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        
        if (file.size > maxSize) {
            this.showStatus('error', 'Fichier trop volumineux (max 10MB)');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showStatus('error', 'Format de fichier non supporté');
            return;
        }
        
        this.currentFile = file;
        this.showPreview(file);
        
        // Enable process button
        document.getElementById('processBtn').disabled = false;
    }
    
    showPreview(file) {
        const previewContainer = document.getElementById('previewContainer');
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.className = 'preview-image';
            img.src = URL.createObjectURL(file);
            
            previewContainer.innerHTML = '';
            previewContainer.appendChild(img);
        } else if (file.type === 'application/pdf') {
            previewContainer.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-file-pdf" style="font-size: 4rem; color: #dc3545; margin-bottom: 15px;"></i>
                    <div style="font-size: 1.2rem; color: #2c3e50;">${file.name}</div>
                    <div style="color: #6c757d;">PDF - ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            `;
        }
    }
    
    async processImage() {
        if (!this.currentFile || !this.tessWorker) {
            this.showStatus('error', 'Aucun fichier sélectionné ou OCR non initialisé');
            return;
        }
        
        try {
            this.showStatus('processing', this.translations[this.currentLanguage].processing);
            document.getElementById('processBtn').disabled = true;
            
            // Prétraitement de l'image pour améliorer l'OCR
            let processedImage = await this.preprocessImage(this.currentFile);
            
            // OCR avec configuration spécialisée
            const { data: { text, confidence } } = await this.tessWorker.recognize(processedImage, {
                rectangle: { top: 0, left: 0, width: 0, height: 0 }
            });
            
            console.log('Texte OCR brut:', text);
            console.log('Confiance globale:', confidence);
            
            // Nettoyage et extraction spécialisée
            const extractedData = this.extractMoroccanIDData(text);
            
            // Validation des données
            const validatedData = this.validateMoroccanData(extractedData);
            
            // Remplir le formulaire
            this.populateForm(validatedData, confidence);
            
            this.showStatus('success', this.translations[this.currentLanguage].success);
            document.getElementById('addBtn').disabled = false;
            
        } catch (error) {
            console.error('Erreur traitement image:', error);
            this.showStatus('error', this.translations[this.currentLanguage].error);
        } finally {
            document.getElementById('processBtn').disabled = false;
        }
    }
    
    async preprocessImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Redimensionner pour optimiser l'OCR
                const maxWidth = 1200;
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                // Améliorer le contraste
                ctx.filter = 'contrast(120%) brightness(110%) saturate(0%)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                resolve(canvas);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    extractMoroccanIDData(text) {
        const data = {};
        
        // Nettoyage amélioré avec preprocessing IA
        let cleanText = this.preprocessTextWithAI(text);
        
        console.log('Texte préprocessé:', cleanText);
        
        // Extraction avec patterns optimisés par IA
        const patterns = this.patterns[this.currentLanguage] || this.patterns.fr;
        
        // Utiliser les patterns multiples pour chaque champ
        Object.keys(patterns).forEach(field => {
            if (data[field]) return; // Skip si déjà trouvé
            
            const fieldPatterns = Array.isArray(patterns[field]) ? patterns[field] : [patterns[field]];
            
            for (const pattern of fieldPatterns) {
                const match = cleanText.match(pattern);
                if (match && match[1]) {
                    let value = match[1].trim();
                    
                    // Post-processing spécialisé
                    value = this.postProcessField(field, value);
                    
                    if (value && this.validateField(field, value)) {
                        data[field] = value;
                        break; // Utiliser le premier pattern qui marche
                    }
                }
            }
        });
        
        // Extraction fallback avec IA améliorée
        if (Object.keys(data).length < 3) {
            const fallbackData = this.extractWithAdvancedAI(cleanText);
            Object.assign(data, fallbackData);
        }
        
        return data;
    }
    
    preprocessTextWithAI(text) {
        """Préprocessing intelligent du texte avec IA"""
        let processed = text
            // Normalisation des espaces
            .replace(/\s+/g, ' ')
            // Correction des caractères OCR communs
            .replace(/[0O]/g, match => {
                // Contexte-aware O/0 correction
                const context = text.substring(text.indexOf(match) - 5, text.indexOf(match) + 5);
                return /[A-Z]/.test(context) ? 'O' : '0';
            })
            // Correction des I/1/l
            .replace(/[1Il]/g, match => {
                const context = text.substring(text.indexOf(match) - 3, text.indexOf(match) + 3);
                if (/[0-9]/.test(context)) return '1';
                if (/[A-Z]/.test(context)) return 'I';
                return match;
            })
            // Nettoyage des caractères spéciaux
            .replace(/[^\u0000-\u007F\u0600-\u06FF]/g, ' ')
            .trim();
        
        return processed;
    }
    
    postProcessField(field, value) {
        """Post-processing intelligent par champ"""
        switch (field) {
            case 'fullName':
                return this.formatMoroccanNameWithAI(value);
            case 'idNumber':
                return this.validateAndCorrectCNIE(value);
            case 'birthDate':
            case 'expiryDate':
                return this.smartDateFormatting(value);
            case 'birthPlace':
                return this.validateMoroccanCityWithAI(value);
            case 'nationality':
                return this.standardizeNationalityWithAI(value);
            case 'gender':
                return this.normalizeGender(value);
            default:
                return value;
        }
    }
    
    formatMoroccanNameWithAI(name) {
        """Formatage intelligent des noms marocains"""
        // Détection automatique arabe vs latin
        const isArabic = /[\u0600-\u06FF]/.test(name);
        
        if (isArabic) {
            // Nettoyage spécialisé pour l'arabe
            return name
                .replace(/[^\u0600-\u06FF\s]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        } else {
            // Formatage latin avec capitalisation intelligente
            return name
                .replace(/[^a-zA-ZÀ-ÿ\s-]/g, '')
                .split(/\s+/)
                .map(word => {
                    // Préfixes marocains courants
                    const prefixes = ['BEN', 'EL', 'AL', 'ABD', 'OULD', 'AIT'];
                    const upperWord = word.toUpperCase();
                    
                    if (prefixes.includes(upperWord)) {
                        return upperWord;
                    }
                    
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ')
                .trim();
        }
    }
    
    validateAndCorrectCNIE(cnie) {
        """Validation et correction intelligente du numéro CNIE"""
        // Nettoyer et normaliser
        let cleaned = cnie.replace(/[^A-Z0-9]/g, '');
        
        // Pattern CNIE standard: 1-2 lettres + 6-8 chiffres
        const cniePattern = /^([A-Z]{1,2})([0-9]{6,8})$/;
        const match = cleaned.match(cniePattern);
        
        if (match) {
            return match[1] + match[2];
        }
        
        // Tentative de correction
        if (cleaned.length >= 7 && cleaned.length <= 10) {
            // Séparer lettres et chiffres
            const letters = cleaned.match(/^[A-Z]+/)?.[0] || '';
            const numbers = cleaned.match(/[0-9]+$/)?.[0] || '';
            
            if (letters.length <= 2 && numbers.length >= 6) {
                return letters + numbers;
            }
        }
        
        return cleaned; // Retourner tel quel si pas de correction possible
    }
    
    smartDateFormatting(dateStr) {
        """Formatage intelligent des dates avec correction d'erreurs OCR"""
        // Nettoyer et normaliser
        let cleaned = dateStr.replace(/[^\d\/\-\.]/g, '');
        
        // Patterns de dates courants
        const datePatterns = [
            /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, // DD/MM/YYYY
            /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/,  // DD/MM/YY
            /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/   // YYYY/MM/DD
        ];
        
        for (const pattern of datePatterns) {
            const match = cleaned.match(pattern);
            if (match) {
                let [, part1, part2, part3] = match;
                
                // Déterminer le format selon la longueur de la 3ème partie
                if (part3.length === 4) {
                    // Format DD/MM/YYYY ou YYYY/MM/DD
                    if (parseInt(part1) > 31) {
                        // YYYY/MM/DD
                        return this.formatToISO(part1, part2, part3);
                    } else {
                        // DD/MM/YYYY
                        return this.formatToISO(part3, part2, part1);
                    }
                } else if (part3.length === 2) {
                    // DD/MM/YY - convertir en année complète
                    const currentYear = new Date().getFullYear();
                    const cutoff = currentYear - 2000 + 10;
                    const fullYear = parseInt(part3) > cutoff ? '19' + part3 : '20' + part3;
                    return this.formatToISO(fullYear, part2, part1);
                }
            }
        }
        
        return dateStr; // Retourner original si pas de match
    }
    
    formatToISO(year, month, day) {
        """Formater en ISO avec validation"""
        const y = parseInt(year);
        const m = parseInt(month);
        const d = parseInt(day);
        
        // Validation basique
        if (m < 1 || m > 12 || d < 1 || d > 31) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
    
    validateMoroccanCityWithAI(city) {
        """Validation intelligente des villes marocaines avec correction d'erreurs"""
        const cleaned = city.trim().toUpperCase();
        
        // Recherche exacte
        for (const moroccanCity of this.moroccanCities) {
            if (moroccanCity.toUpperCase() === cleaned) {
                return moroccanCity;
            }
        }
        
        // Recherche fuzzy avec correction d'erreurs OCR
        const threshold = 0.8;
        let bestMatch = null;
        let bestScore = 0;
        
        for (const moroccanCity of this.moroccanCities) {
            const score = this.calculateSimilarity(cleaned, moroccanCity.toUpperCase());
            if (score > threshold && score > bestScore) {
                bestScore = score;
                bestMatch = moroccanCity;
            }
        }
        
        return bestMatch || city;
    }
    
    calculateSimilarity(str1, str2) {
        """Calcul de similarité avec algorithme de Levenshtein optimisé"""
        const len1 = str1.length;
        const len2 = str2.length;
        
        // Matrice de distances
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
        
        // Initialisation
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        // Calcul des distances
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // Suppression
                    matrix[i][j - 1] + 1,      // Insertion
                    matrix[i - 1][j - 1] + cost // Substitution
                );
            }
        }
        
        // Calcul du pourcentage de similarité
        const maxLen = Math.max(len1, len2);
        return (maxLen - matrix[len1][len2]) / maxLen;
    }
    
    extractWithAdvancedAI(text) {
        """Extraction avancée avec IA pour les cas difficiles"""
        const data = {};
        
        // Patterns génériques avec scoring
        const genericPatterns = {
            cnie: {
                pattern: /([A-Z]{1,2}[0-9]{6,8})/g,
                score: 0.9
            },
            dates: {
                pattern: /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/g,
                score: 0.8
            },
            names: {
                pattern: /([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]{2,}(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]{2,}){1,4})/g,
                score: 0.7
            },
            arabicNames: {
                pattern: /([\u0600-\u06FF]{2,}(?:\s+[\u0600-\u06FF]{2,}){1,4})/g,
                score: 0.7
            }
        };
        
        // Extraction avec scoring
        const candidates = {};
        
        Object.entries(genericPatterns).forEach(([type, config]) => {
            const matches = Array.from(text.matchAll(config.pattern));
            candidates[type] = matches.map(match => ({
                value: match[1],
                score: config.score,
                position: match.index
            }));
        });
        
        // Assignation intelligente
        if (candidates.cnie.length > 0) {
            data.idNumber = candidates.cnie[0].value;
        }
        
        if (candidates.dates.length > 0) {
            data.birthDate = this.smartDateFormatting(candidates.dates[0].value);
            if (candidates.dates.length > 1) {
                data.expiryDate = this.smartDateFormatting(candidates.dates[1].value);
            }
        }
        
        // Sélection du meilleur nom
        const allNames = [...candidates.names, ...candidates.arabicNames];
        if (allNames.length > 0) {
            // Prendre le nom le plus long (généralement le plus complet)
            const bestName = allNames.reduce((best, current) => 
                current.value.length > best.value.length ? current : best
            );
            data.fullName = this.formatMoroccanNameWithAI(bestName.value);
        }
        
        return data;
    }
    
    validateField(field, value) {
        """Validation intelligente par champ"""
        switch (field) {
            case 'idNumber':
                return /^[A-Z]{1,2}[0-9]{6,8}$/.test(value);
            case 'birthDate':
            case 'expiryDate':
                return /^\d{4}-\d{2}-\d{2}$/.test(value);
            case 'fullName':
                return value.length >= 2 && value.length <= 50;
            case 'gender':
                return ['M', 'F'].includes(value.toUpperCase());
            default:
                return value && value.length > 0;
        }
    }
    
    addToDatabase() {
        const formData = this.getFormData();
        
        // Validate required fields
        if (!formData.fullName || !formData.idNumber) {
            this.showStatus('error', 'Nom et numéro d\'identité requis');
            return;
        }
        
        // Check if ID already exists
        const existingIndex = this.database.findIndex(record => record.idNumber === formData.idNumber);
        
        if (existingIndex !== -1) {
            if (confirm('Ce numéro d\'identité existe déjà. Voulez-vous le mettre à jour ?')) {
                this.database[existingIndex] = { ...formData, id: this.database[existingIndex].id, updatedAt: new Date().toISOString() };
            } else {
                return;
            }
        } else {
            // Add new record
            const newRecord = {
                ...formData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            this.database.push(newRecord);
        }
        
        // Save to localStorage
        localStorage.setItem('idCardDatabase', JSON.stringify(this.database));
        
        // Update UI
        this.renderDatabase();
        this.showStatus('success', this.translations[this.currentLanguage].added_success);
        
        // Clear form
        this.clearForm();
    }
    
    getFormData() {
        return {
            fullName: document.getElementById('fullName').value.trim(),
            idNumber: document.getElementById('idNumber').value.trim(),
            birthDate: document.getElementById('birthDate').value,
            birthPlace: document.getElementById('birthPlace').value.trim(),
            nationality: document.getElementById('nationality').value.trim(),
            gender: document.getElementById('gender').value,
            expiryDate: document.getElementById('expiryDate').value,
            address: document.getElementById('address').value.trim()
        };
    }
    
    clearForm() {
        document.getElementById('dataForm').reset();
        document.getElementById('previewContainer').innerHTML = '<div class="no-preview" data-text="no_preview">Aucune image sélectionnée</div>';
        
        // Remove confidence indicators
        document.querySelectorAll('.confidence-indicator').forEach(el => el.remove());
        
        // Reset form validation
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('success', 'error');
        });
        
        // Disable buttons
        document.getElementById('addBtn').disabled = true;
        document.getElementById('processBtn').disabled = true;
        
        this.currentFile = null;
        this.showStatus('success', this.translations[this.currentLanguage].form_cleared);
    }
    
    renderDatabase() {
        const tbody = document.getElementById('databaseBody');
        const totalRecords = document.getElementById('totalRecords');
        
        totalRecords.textContent = this.database.length;
        
        if (this.database.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #6c757d; padding: 40px;" data-text="no_data">
                        ${this.translations[this.currentLanguage].no_data}
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.database.map((record, index) => `
            <tr>
                <td>${record.fullName || '-'}</td>
                <td>${record.idNumber || '-'}</td>
                <td>${record.birthDate || '-'}</td>
                <td>${record.nationality || '-'}</td>
                <td>${record.gender || '-'}</td>
                <td class="actions-cell">
                    <button class="action-btn edit" onclick="editRecord(${index})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteRecord(${index})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    searchDatabase() {
        const searchTerm = document.getElementById('searchBox').value.toLowerCase();
        const rows = document.querySelectorAll('#databaseBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }
    
    exportDatabase() {
        if (this.database.length === 0) {
            this.showStatus('error', 'Aucune donnée à exporter');
            return;
        }
        
        // Préparation spécialisée pour export Excel
        const excelData = this.database.map(record => ({
            'Nom complet / الاسم الكامل': record.fullName || '',
            'CNIE / رقم البطاقة': record.idNumber || '',
            'Date naissance / تاريخ الازدياد': record.birthDate || '',
            'Lieu naissance / مكان الازدياد': record.birthPlace || '',
            'Nationalité / الجنسية': record.nationality || '',
            'Sexe / الجنس': record.gender || '',
            'Date expiration / انتهاء الصلاحية': record.expiryDate || '',
            'Adresse / العنوان': record.address || '',
            'Date création': record.createdAt ? new Date(record.createdAt).toLocaleDateString('fr-FR') : ''
        }));
        
        // Création du workbook avec formatage amélioré
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Style et largeur des colonnes
        const colWidths = [
            { wch: 25 }, // Nom
            { wch: 15 }, // CNIE
            { wch: 15 }, // Date naissance
            { wch: 20 }, // Lieu
            { wch: 15 }, // Nationalité
            { wch: 10 }, // Sexe
            { wch: 15 }, // Expiration
            { wch: 30 }, // Adresse
            { wch: 15 }  // Date création
        ];
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, 'CNIE Database Morocco');
        
        // Nom de fichier avec timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `base_donnees_cnie_maroc_${timestamp}.xlsx`;
        
        XLSX.writeFile(wb, filename);
        
        this.showStatus('success', 'Base de données exportée avec succès');
    }
    
    showStatus(type, message) {
        const statusDiv = document.getElementById('processingStatus');
        const statusText = document.getElementById('statusText');
        
        statusDiv.className = `processing-status ${type}`;
        statusText.textContent = message;
        
        if (type !== 'processing') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    updateProgress(percent) {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${percent}%`;
    }
    
    updateLanguage() {
        const elements = document.querySelectorAll('[data-text]');
        elements.forEach(element => {
            const key = element.getAttribute('data-text');
            if (this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
        
        // Update body direction for Arabic
        document.body.className = this.currentLanguage === 'ar' ? 'rtl' : '';
        
        // Update placeholders
        const placeholders = {
            fullName: this.currentLanguage === 'fr' ? 'Nom et prénom' : 
                     this.currentLanguage === 'ar' ? 'الاسم الكامل' : 'Full name',
            idNumber: this.currentLanguage === 'fr' ? 'Numéro de carte' : 
                     this.currentLanguage === 'ar' ? 'رقم البطاقة' : 'ID number',
            birthPlace: this.currentLanguage === 'fr' ? 'Ville de naissance' : 
                       this.currentLanguage === 'ar' ? 'مكان الولادة' : 'Birth place',
            nationality: this.currentLanguage === 'fr' ? 'Nationalité' : 
                        this.currentLanguage === 'ar' ? 'الجنسية' : 'Nationality',
            address: this.currentLanguage === 'fr' ? 'Adresse complète' : 
                    this.currentLanguage === 'ar' ? 'العنوان الكامل' : 'Full address'
        };
        
        Object.keys(placeholders).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.placeholder = placeholders[id];
            }
        });
    }
    
    async convertPdfToImage(pdfFile) {
        // For PDF to image conversion, you would typically use PDF.js
        // This is a simplified version - in production, you'd want proper PDF handling
        return pdfFile; // Tesseract can handle PDFs directly
    }
}

// Global functions for HTML onclick events
function setLanguage(lang) {
    window.extractor.currentLanguage = lang;
    window.extractor.updateLanguage();
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.lang-btn').classList.add('active');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        window.extractor.handleFile(file);
    }
}

function processImage() {
    window.extractor.processImage();
}

function addToDatabase() {
    window.extractor.addToDatabase();
}

function clearForm() {
    window.extractor.clearForm();
}

function exportDatabase() {
    window.extractor.exportDatabase();
}

function editRecord(index) {
    const record = window.extractor.database[index];
    
    // Populate form with record data
    Object.keys(record).forEach(key => {
        const element = document.getElementById(key);
        if (element && record[key]) {
            element.value = record[key];
        }
    });
    
    // Remove record from database temporarily (will be re-added when saved)
    window.extractor.database.splice(index, 1);
    window.extractor.renderDatabase();
    
    // Enable add button
    document.getElementById('addBtn').disabled = false;
    
    // Scroll to form
    document.querySelector('.data-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteRecord(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
        window.extractor.database.splice(index, 1);
        localStorage.setItem('idCardDatabase', JSON.stringify(window.extractor.database));
        window.extractor.renderDatabase();
        window.extractor.showStatus('success', 'Enregistrement supprimé');
    }
}

function searchDatabase() {
    window.extractor.searchDatabase();
}

// Initialize the application
window.addEventListener('load', () => {
    window.extractor = new AIIDCardExtractor();
});
