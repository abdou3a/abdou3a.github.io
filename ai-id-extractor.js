class AIIDCardExtractor {
    constructor() {
        this.currentLanguage = 'fr';
        this.database = JSON.parse(localStorage.getItem('idCardDatabase') || '[]');
        this.currentFile = null;
        this.tessWorker = null;
        
        // Patterns for different languages and ID formats
        this.patterns = {
            // French ID patterns
            fr: {
                fullName: /(?:nom|name|prénom)\s*:?\s*([a-záéèêëïîôùûüÿç\s-]+)/i,
                idNumber: /(?:n°|num|numéro|carte)\s*:?\s*([a-zA-Z0-9\s-]+)/i,
                birthDate: /(?:né|née|birth|naissance)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                birthPlace: /(?:né|née|à|birth place|lieu)\s*:?\s*([a-záéèêëïîôùûüÿç\s-]+)/i,
                nationality: /(?:nationalité|nationality)\s*:?\s*([a-záéèêëïîôùûüÿç\s-]+)/i,
                gender: /(?:sexe|sex|genre)\s*:?\s*([mfhd])/i,
                expiryDate: /(?:expire|expiration|valable|valid)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i
            },
            
            // Arabic ID patterns
            ar: {
                fullName: /(?:الاسم|الإسم|اسم)\s*:?\s*([\u0600-\u06FF\s]+)/,
                idNumber: /(?:رقم|الرقم|بطاقة)\s*:?\s*([0-9\s-]+)/,
                birthDate: /(?:تاريخ|ولادة|مولود)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/,
                birthPlace: /(?:مكان|محل|ولادة|مولود)\s*:?\s*([\u0600-\u06FF\s]+)/,
                nationality: /(?:جنسية|الجنسية)\s*:?\s*([\u0600-\u06FF\s]+)/,
                gender: /(?:جنس|النوع)\s*:?\s*(ذكر|أنثى|م|ف)/,
                expiryDate: /(?:انتهاء|صالح|صلاحية)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/
            },
            
            // English ID patterns
            en: {
                fullName: /(?:name|full name|given name)\s*:?\s*([a-zA-Z\s-]+)/i,
                idNumber: /(?:id|identity|card|number)\s*:?\s*([a-zA-Z0-9\s-]+)/i,
                birthDate: /(?:birth|born|date of birth|dob)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i,
                birthPlace: /(?:place of birth|birth place|born in)\s*:?\s*([a-zA-Z\s-]+)/i,
                nationality: /(?:nationality|citizen)\s*:?\s*([a-zA-Z\s-]+)/i,
                gender: /(?:sex|gender)\s*:?\s*([mf])/i,
                expiryDate: /(?:expires|expiry|expiration|valid until)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i
            }
        };
        
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
            
            // Initialize with multiple languages
            await this.tessWorker.loadLanguage('eng+ara+fra');
            await this.tessWorker.initialize('eng+ara+fra');
            
            console.log('Tesseract initialized successfully');
        } catch (error) {
            console.error('Error initializing Tesseract:', error);
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
            
            // Convert file to image if PDF
            let imageFile = this.currentFile;
            if (this.currentFile.type === 'application/pdf') {
                imageFile = await this.convertPdfToImage(this.currentFile);
            }
            
            // Perform OCR
            const { data: { text, confidence } } = await this.tessWorker.recognize(imageFile);
            
            console.log('OCR Text:', text);
            console.log('Confidence:', confidence);
            
            // Extract structured data
            const extractedData = this.extractDataFromText(text);
            
            // Populate form
            this.populateForm(extractedData, confidence);
            
            this.showStatus('success', this.translations[this.currentLanguage].success);
            document.getElementById('addBtn').disabled = false;
            
        } catch (error) {
            console.error('Error processing image:', error);
            this.showStatus('error', this.translations[this.currentLanguage].error);
        } finally {
            document.getElementById('processBtn').disabled = false;
        }
    }
    
    extractDataFromText(text) {
        const data = {};
        const currentPatterns = this.patterns[this.currentLanguage] || this.patterns.en;
        
        // Clean text
        const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
        
        // Extract each field
        Object.keys(currentPatterns).forEach(field => {
            const pattern = currentPatterns[field];
            const match = cleanText.match(pattern);
            
            if (match && match[1]) {
                let value = match[1].trim();
                
                // Clean and format value based on field type
                switch (field) {
                    case 'birthDate':
                    case 'expiryDate':
                        value = this.formatDate(value);
                        break;
                    case 'fullName':
                    case 'birthPlace':
                    case 'nationality':
                        value = this.formatName(value);
                        break;
                    case 'gender':
                        value = this.formatGender(value);
                        break;
                    case 'idNumber':
                        value = value.replace(/\s/g, '');
                        break;
                }
                
                data[field] = value;
            }
        });
        
        // Try fallback patterns if main patterns don't work
        if (Object.keys(data).length < 3) {
            const fallbackData = this.extractWithFallbackPatterns(cleanText);
            Object.assign(data, fallbackData);
        }
        
        return data;
    }
    
    extractWithFallbackPatterns(text) {
        const data = {};
        
        // Generic patterns that work across languages
        const genericPatterns = {
            // Dates in various formats
            dates: /([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/g,
            // ID numbers (alphanumeric)
            idNumbers: /([A-Z0-9]{6,})/g,
            // Names (consecutive words starting with capital letters)
            names: /([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+)*)/g
        };
        
        // Extract dates
        const dates = text.match(genericPatterns.dates) || [];
        if (dates.length >= 1) data.birthDate = this.formatDate(dates[0]);
        if (dates.length >= 2) data.expiryDate = this.formatDate(dates[1]);
        
        // Extract ID numbers
        const idNumbers = text.match(genericPatterns.idNumbers) || [];
        if (idNumbers.length > 0) {
            data.idNumber = idNumbers.find(id => id.length >= 8) || idNumbers[0];
        }
        
        // Extract names
        const names = text.match(genericPatterns.names) || [];
        if (names.length > 0) {
            // Usually the longest name sequence is the full name
            data.fullName = names.reduce((a, b) => a.length > b.length ? a : b);
        }
        
        return data;
    }
    
    formatDate(dateStr) {
        // Convert various date formats to YYYY-MM-DD
        const cleanDate = dateStr.replace(/[^\d\/\-\.]/g, '');
        const parts = cleanDate.split(/[\/\-\.]/);
        
        if (parts.length === 3) {
            let [day, month, year] = parts;
            
            // Handle 2-digit years
            if (year.length === 2) {
                year = parseInt(year) > 50 ? '19' + year : '20' + year;
            }
            
            // Ensure proper format
            if (day.length === 1) day = '0' + day;
            if (month.length === 1) month = '0' + month;
            
            return `${year}-${month}-${day}`;
        }
        
        return dateStr;
    }
    
    formatName(name) {
        return name.split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    formatGender(gender) {
        const g = gender.toLowerCase();
        if (g.includes('m') || g.includes('ذكر') || g.includes('male')) return 'M';
        if (g.includes('f') || g.includes('أنثى') || g.includes('female')) return 'F';
        return gender;
    }
    
    populateForm(data, confidence) {
        const fields = ['fullName', 'idNumber', 'birthDate', 'birthPlace', 'nationality', 'gender', 'expiryDate', 'address'];
        
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && data[field]) {
                input.value = data[field];
                
                // Add confidence indicator
                this.addConfidenceIndicator(input, confidence);
                
                // Validate field
                this.validateField(input);
            }
        });
    }
    
    addConfidenceIndicator(input, confidence) {
        // Remove existing indicator
        const existing = input.parentNode.querySelector('.confidence-indicator');
        if (existing) existing.remove();
        
        // Add new indicator
        const indicator = document.createElement('span');
        indicator.className = 'confidence-indicator';
        
        if (confidence > 80) {
            indicator.className += ' confidence-high';
            indicator.textContent = `${Math.round(confidence)}% ✓`;
        } else if (confidence > 60) {
            indicator.className += ' confidence-medium';
            indicator.textContent = `${Math.round(confidence)}% ⚠`;
        } else {
            indicator.className += ' confidence-low';
            indicator.textContent = `${Math.round(confidence)}% ⚠`;
        }
        
        input.parentNode.appendChild(indicator);
    }
    
    validateField(input) {
        const value = input.value.trim();
        
        if (value) {
            input.classList.remove('error');
            input.classList.add('success');
        } else {
            input.classList.remove('success');
            input.classList.add('error');
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
        
        // Prepare data for Excel
        const excelData = this.database.map(record => ({
            'Nom complet': record.fullName || '',
            'Numéro d\'identité': record.idNumber || '',
            'Date de naissance': record.birthDate || '',
            'Lieu de naissance': record.birthPlace || '',
            'Nationalité': record.nationality || '',
            'Sexe': record.gender || '',
            'Date d\'expiration': record.expiryDate || '',
            'Adresse': record.address || '',
            'Date de création': record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ''
        }));
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Auto-size columns
        const colWidths = [];
        Object.keys(excelData[0]).forEach(key => {
            const maxLength = Math.max(
                key.length,
                ...excelData.map(row => (row[key] || '').toString().length)
            );
            colWidths.push({ wch: Math.min(maxLength + 2, 50) });
        });
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, 'ID Cards Database');
        
        // Generate filename
        const filename = `id_cards_database_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Download file
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
