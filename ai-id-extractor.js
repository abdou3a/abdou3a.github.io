class AIIDCardExtractor {
    constructor() {
        this.currentLanguage = 'fr';
        this.database = JSON.parse(localStorage.getItem('idCardDatabase') || '[]');
        this.currentFile = null;
        this.tessWorker = null;
        
        // Patterns spécialisés pour cartes d'identité marocaines
        this.patterns = {
            // Patterns français pour cartes marocaines
            fr: {
                fullName: /(?:nom\s*et\s*prénom|nom|prénom)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i,
                idNumber: /(?:n°|num|numéro|carte\s*nationale)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/i,
                birthDate: /(?:né\s*le|naissance|date\s*de\s*naissance)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                birthPlace: /(?:né\s*à|lieu\s*de\s*naissance|à)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i,
                nationality: /(?:nationalité|marocaine)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)/i,
                gender: /(?:sexe)\s*:?\s*([MFmf])/i,
                expiryDate: /(?:expire\s*le|expiration|valable\s*jusqu|validité)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                cnie: /(?:CNIE|C\.N\.I\.E)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/i
            },
            
            // Patterns arabes pour cartes marocaines
            ar: {
                fullName: /(?:الاسم\s*الكامل|الاسم\s*و\s*النسب|الإسم)\s*:?\s*([\u0600-\u06FF\s]+)/,
                idNumber: /(?:رقم\s*البطاقة|ب\.و\.ت\.م|بطاقة\s*التعريف)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/,
                birthDate: /(?:تاريخ\s*الازدياد|مولود\s*في|الازدياد)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/,
                birthPlace: /(?:مكان\s*الازدياد|مولود\s*ب|بـ)\s*:?\s*([\u0600-\u06FF\s]+)/,
                nationality: /(?:الجنسية|مغربي|مغربية)\s*:?\s*([\u0600-\u06FF\s]+)/,
                gender: /(?:الجنس|النوع)\s*:?\s*(ذكر|أنثى|م|ف)/,
                expiryDate: /(?:صالحة\s*إلى|انتهاء\s*الصلاحية|تنتهي\s*في)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/,
                cnie: /(?:ب\.و\.ت\.م|بطاقة\s*التعريف)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})/
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
        
        // Villes marocaines pour validation
        this.moroccanCities = [
            'CASABLANCA', 'RABAT', 'FES', 'MARRAKECH', 'AGADIR', 'TANGIER', 'MEKNES', 'OUJDA',
            'KENITRA', 'TETOUAN', 'SAFI', 'MOHAMMEDIA', 'KHOURIBGA', 'BENI MELLAL', 'EL JADIDA',
            'TAZA', 'NADOR', 'SETTAT', 'LARACHE', 'KSAR EL KEBIR', 'SALE', 'BERRECHID',
            'الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'أكادير', 'طنجة', 'مكناس', 'وجدة',
            'القنيطرة', 'تطوان', 'آسفي', 'المحمدية', 'خريبكة', 'بني ملال', 'الجديدة'
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
        
        // Nettoyage spécialisé pour cartes marocaines
        let cleanText = text
            .replace(/[^\u0000-\u007F\u0600-\u06FF]/g, ' ') // Garder Latin + Arabe
            .replace(/\s+/g, ' ')
            .trim();
            
        console.log('Texte nettoyé:', cleanText);
        
        // Extraction avec patterns spécialisés
        const patterns = this.patterns[this.currentLanguage] || this.patterns.fr;
        
        // Recherche du numéro CNIE (priorité)
        const cnieMatch = cleanText.match(/([A-Z]{1,2}[0-9]{6,8})/g);
        if (cnieMatch) {
            data.idNumber = cnieMatch[0];
        }
        
        // Extraction des autres champs
        Object.keys(patterns).forEach(field => {
            if (data[field]) return; // Skip si déjà trouvé
            
            const pattern = patterns[field];
            const match = cleanText.match(pattern);
            
            if (match && match[1]) {
                let value = match[1].trim();
                
                switch (field) {
                    case 'birthDate':
                    case 'expiryDate':
                        value = this.formatMoroccanDate(value);
                        break;
                    case 'fullName':
                        value = this.formatMoroccanName(value);
                        break;
                    case 'birthPlace':
                        value = this.validateMoroccanCity(value);
                        break;
                    case 'nationality':
                        value = this.standardizeNationality(value);
                        break;
                    case 'gender':
                        value = this.formatGender(value);
                        break;
                }
                
                if (value) {
                    data[field] = value;
                }
            }
        });
        
        // Extraction fallback avec patterns génériques
        if (Object.keys(data).length < 3) {
            const fallbackData = this.extractFallbackMoroccanData(cleanText);
            Object.assign(data, fallbackData);
        }
        
        return data;
    }
    
    extractFallbackMoroccanData(text) {
        const data = {};
        
        // Recherche de numéros CNIE
        const cniePattern = /([A-Z]{1,2}[0-9]{6,8})/g;
        const cnieMatches = text.match(cniePattern);
        if (cnieMatches && !data.idNumber) {
            data.idNumber = cnieMatches[0];
        }
        
        // Recherche de dates (format marocain)
        const datePattern = /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/g;
        const dates = text.match(datePattern);
        if (dates) {
            if (!data.birthDate) data.birthDate = this.formatMoroccanDate(dates[0]);
            if (dates.length > 1 && !data.expiryDate) {
                data.expiryDate = this.formatMoroccanDate(dates[1]);
            }
        }
        
        // Recherche de noms (séquences de mots capitalisés)
        const namePattern = /([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+){1,3})/g;
        const names = text.match(namePattern);
        if (names && !data.fullName) {
            // Prendre le nom le plus long
            data.fullName = names.reduce((a, b) => a.length > b.length ? a : b);
        }
        
        // Recherche de villes marocaines
        if (!data.birthPlace) {
            for (const city of this.moroccanCities) {
                if (text.toUpperCase().includes(city.toUpperCase())) {
                    data.birthPlace = city;
                    break;
                }
            }
        }
        
        return data;
    }
    
    formatMoroccanDate(dateStr) {
        // Formats de dates marocaines: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
        const cleaned = dateStr.replace(/[^\d\/\-\.]/g, '');
        const parts = cleaned.split(/[\/\-\.]/);
        
        if (parts.length === 3) {
            let [day, month, year] = parts;
            
            // Gestion années courtes
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const cutoff = currentYear - 2000 + 10;
                year = parseInt(year) > cutoff ? '19' + year : '20' + year;
            }
            
            // Format ISO
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            
            // Validation
            if (parseInt(day) > 31 || parseInt(month) > 12) {
                return dateStr; // Retourner original si invalide
            }
            
            return `${year}-${month}-${day}`;
        }
        
        return dateStr;
    }
    
    formatMoroccanName(name) {
        // Nettoyage spécialisé pour noms marocains
        return name
            .replace(/[^\u0600-\u06FF\u0000-\u007F\s-]/g, '') // Garder arabe + latin
            .split(/\s+/)
            .map(word => {
                if (/[\u0600-\u06FF]/.test(word)) {
                    return word; // Garder arabe tel quel
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ')
            .trim();
    }
    
    validateMoroccanCity(city) {
        const cleaned = city.trim().toUpperCase();
        
        // Recherche exacte
        for (const moroccanCity of this.moroccanCities) {
            if (moroccanCity.toUpperCase() === cleaned) {
                return moroccanCity;
            }
        }
        
        // Recherche partielle
        for (const moroccanCity of this.moroccanCities) {
            if (moroccanCity.toUpperCase().includes(cleaned) || 
                cleaned.includes(moroccanCity.toUpperCase())) {
                return moroccanCity;
            }
        }
        
        return city; // Retourner original si pas trouvé
    }
    
    standardizeNationality(nationality) {
        const n = nationality.toLowerCase().trim();
        
        if (n.includes('maroc') || n.includes('مغرب') || n.includes('moroccan')) {
            return this.currentLanguage === 'ar' ? 'مغربية' : 'Marocaine';
        }
        
        return nationality;
    }
    
    validateMoroccanData(data) {
        // Validation spécialisée pour données marocaines
        const validated = { ...data };
        
        // Validation numéro CNIE
        if (validated.idNumber) {
            const cnieRegex = /^[A-Z]{1,2}[0-9]{6,8}$/;
            if (!cnieRegex.test(validated.idNumber)) {
                console.warn('Format CNIE invalide:', validated.idNumber);
                // Tentative de correction
                const match = validated.idNumber.match(/([A-Z]{1,2}[0-9]{6,8})/);
                if (match) {
                    validated.idNumber = match[1];
                }
            }
        }
        
        // Validation dates
        if (validated.birthDate) {
            const birthYear = parseInt(validated.birthDate.split('-')[0]);
            const currentYear = new Date().getFullYear();
            
            if (birthYear < 1920 || birthYear > currentYear) {
                console.warn('Année de naissance suspecte:', birthYear);
            }
        }
        
        // Validation nationalité par défaut
        if (!validated.nationality) {
            validated.nationality = this.currentLanguage === 'ar' ? 'مغربية' : 'Marocaine';
        }
        
        return validated;
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
