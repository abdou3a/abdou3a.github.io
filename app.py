from flask import Flask, render_template, request, jsonify, send_file
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np
import re
import json
import os
from datetime import datetime
import pandas as pd
from werkzeug.utils import secure_filename
import sqlite3
from io import BytesIO
import base64

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.secret_key = 'cnie_extractor_secret_key_2024'

# Créer le dossier uploads s'il n'existe pas
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

class MoroccanCNIEExtractor:
    def __init__(self):
        # Configuration Tesseract améliorée
        self.tesseract_config = '--oem 3 --psm 6'
        
        # Patterns flexibles pour cartes marocaines
        self.patterns = {
            'fr': {
                'fullName': [
                    r'(?:nom\s*et\s*prénom|nom|prénom)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)',
                    r'([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]+){1,4})',
                    r'TITULAIRE\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)'
                ],
                'idNumber': [
                    r'(?:n°|num|numéro|carte\s*nationale|cnie)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})',
                    r'([A-Z]{1,2}[0-9]{6,8})',
                    r'CNIE\s*:?\s*([A-Z]{1,2}[0-9]{6,8})'
                ],
                'birthDate': [
                    r'(?:né\s*le|naissance|date\s*de\s*naissance|né?\s*le?)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                    r'([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})',
                    r'NAISSANCE\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
                ],
                'birthPlace': [
                    r'(?:né\s*à|lieu\s*de\s*naissance|à)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)',
                    r'LIEU\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)'
                ],
                'nationality': [
                    r'(?:nationalité|marocaine)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)',
                    r'MAROCAINE?'
                ],
                'gender': [
                    r'(?:sexe)\s*:?\s*([MFmf])',
                    r'(MASCULIN|FEMININ|M|F)'
                ],
                'expiryDate': [
                    r'(?:expire\s*le|expiration|valable\s*jusqu|validité)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                    r'VALIDITE\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
                ]
            },
            'ar': {
                'fullName': r'(?:الاسم\s*الكامل|الاسم\s*و\s*النسب|الإسم)\s*:?\s*([\u0600-\u06FF\s]+)',
                'idNumber': r'(?:رقم\s*البطاقة|ب\.و\.ت\.م|بطاقة\s*التعريف)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})',
                'birthDate': r'(?:تاريخ\s*الازدياد|مولود\s*في|الازدياد)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                'birthPlace': r'(?:مكان\s*الازدياد|مولود\s*ب|بـ)\s*:?\s*([\u0600-\u06FF\s]+)',
                'nationality': r'(?:الجنسية|مغربي|مغربية)\s*:?\s*([\u0600-\u06FF\s]+)',
                'gender': r'(?:الجنس|النوع)\s*:?\s*(ذكر|أنثى|م|ف)',
                'expiryDate': r'(?:صالحة\s*إلى|انتهاء\s*الصلاحية|تنتهي\s*في)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
            },
            'en': {
                'fullName': r'(?:full\s*name|name\s*and\s*surname|name)\s*:?\s*([A-Za-z\s-]+)',
                'idNumber': r'(?:national\s*id|id\s*card|cnie)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})',
                'birthDate': r'(?:date\s*of\s*birth|born\s*on|birth\s*date)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                'birthPlace': r'(?:place\s*of\s*birth|born\s*in|birth\s*place)\s*:?\s*([A-Za-z\s-]+)',
                'nationality': r'(?:nationality|moroccan)\s*:?\s*([A-Za-z\s-]+)',
                'gender': r'(?:sex|gender)\s*:?\s*([MFmf])',
                'expiryDate': r'(?:expires\s*on|expiry\s*date|valid\s*until)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
            }
        }
        
        # Villes marocaines pour validation
        self.moroccan_cities = [
            'CASABLANCA', 'RABAT', 'FES', 'MARRAKECH', 'AGADIR', 'TANGIER', 'MEKNES', 'OUJDA',
            'KENITRA', 'TETOUAN', 'SAFI', 'MOHAMMEDIA', 'KHOURIBGA', 'BENI MELLAL', 'EL JADIDA',
            'TAZA', 'NADOR', 'SETTAT', 'LARACHE', 'KSAR EL KEBIR', 'SALE', 'BERRECHID',
            'الدار البيضاء', 'الرباط', 'فاس', 'مراكش', 'أكادير', 'طنجة', 'مكناس', 'وجدة',
            'القنيطرة', 'تطوان', 'آسفي', 'المحمدية', 'خريبكة', 'بني ملال', 'الجديدة'
        ]
        
        # Initialiser la base de données
        self.init_database()
    
    def init_database(self):
        """Initialiser la base de données SQLite"""
        conn = sqlite3.connect('cnie_database.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cnie_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT,
                id_number TEXT UNIQUE,
                birth_date TEXT,
                birth_place TEXT,
                nationality TEXT,
                gender TEXT,
                expiry_date TEXT,
                address TEXT,
                confidence REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def preprocess_image(self, image_path):
        """Prétraitement avancé de l'image pour améliorer l'OCR"""
        try:
            # Lire l'image avec OpenCV
            img = cv2.imread(image_path)
            
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Améliorer le contraste
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            
            # Débruitage
            denoised = cv2.medianBlur(enhanced, 3)
            
            # Améliorer la netteté
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(denoised, -1, kernel)
            
            # Binarisation adaptative
            thresh = cv2.adaptiveThreshold(
                sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Sauvegarder l'image traitée
            processed_path = image_path.replace('.', '_processed.')
            cv2.imwrite(processed_path, thresh)
            
            return processed_path
            
        except Exception as e:
            print(f"Erreur prétraitement: {e}")
            return image_path
    
    def extract_text_from_image(self, image_path, languages=['ara', 'fra', 'eng']):
        """Extraction de texte avec OCR multilingue"""
        try:
            # Prétraitement de l'image
            processed_image = self.preprocess_image(image_path)
            
            # Configuration Tesseract
            lang_string = '+'.join(languages)
            config = f'-l {lang_string} {self.tesseract_config}'
            
            # Extraction du texte
            text = pytesseract.image_to_string(
                Image.open(processed_image), 
                config=config
            )
            
            # Obtenir la confiance
            data = pytesseract.image_to_data(
                Image.open(processed_image), 
                config=config, 
                output_type=pytesseract.Output.DICT
            )
            
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return text, avg_confidence
            
        except Exception as e:
            print(f"Erreur OCR: {e}")
            return "", 0
    
    def extract_moroccan_data(self, text, language='fr'):
        """Extraction spécialisée pour cartes marocaines"""
        extracted_data = {}
        
        # Nettoyage du texte
        clean_text = re.sub(r'[^\u0000-\u007F\u0600-\u06FF]', ' ', text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        print(f"Texte nettoyé: {clean_text[:200]}...")
        
        # Utiliser les patterns de la langue spécifiée
        patterns = self.patterns.get(language, self.patterns['fr'])
        
        # Recherche prioritaire du numéro CNIE avec patterns multiples
        if 'idNumber' in patterns:
            for pattern in patterns['idNumber']:
                matches = re.findall(pattern, clean_text, re.IGNORECASE)
                if matches:
                    extracted_data['idNumber'] = matches[0]
                    break
        
        # Extraction avec patterns multiples pour chaque champ
        for field, pattern_list in patterns.items():
            if field in extracted_data:
                continue
            
            # Si c'est une liste de patterns, essayer chacun
            if isinstance(pattern_list, list):
                for pattern in pattern_list:
                    match = re.search(pattern, clean_text, re.IGNORECASE)
                    if match:
                        value = match.group(1).strip() if match.groups() else match.group(0).strip()
                        
                        # Formatage selon le type de champ
                        if field in ['birthDate', 'expiryDate']:
                            value = self.format_moroccan_date(value)
                        elif field == 'fullName':
                            value = self.format_moroccan_name(value)
                        elif field == 'birthPlace':
                            value = self.validate_moroccan_city(value)
                        elif field == 'nationality':
                            value = self.standardize_nationality(value, language)
                        elif field == 'gender':
                            value = self.format_gender(value)
                        
                        if value:
                            extracted_data[field] = value
                            break
            else:
                # Pattern simple (rétrocompatibilité)
                match = re.search(pattern_list, clean_text, re.IGNORECASE)
                if match:
                    value = match.group(1).strip()
                    
                    # Formatage selon le type de champ
                    if field in ['birthDate', 'expiryDate']:
                        value = self.format_moroccan_date(value)
                    elif field == 'fullName':
                        value = self.format_moroccan_name(value)
                    elif field == 'birthPlace':
                        value = self.validate_moroccan_city(value)
                    elif field == 'nationality':
                        value = self.standardize_nationality(value, language)
                    elif field == 'gender':
                        value = self.format_gender(value)
                    
                    if value:
                        extracted_data[field] = value
                    value = self.validate_moroccan_city(value)
                elif field == 'nationality':
                    value = self.standardize_nationality(value, language)
                elif field == 'gender':
                    value = self.format_gender(value)
                
                if value:
                    extracted_data[field] = value
        
        # Extraction fallback si peu de données
        if len(extracted_data) < 3:
            fallback_data = self.extract_fallback_data(clean_text)
            extracted_data.update(fallback_data)
        
        # Validation finale
        validated_data = self.validate_moroccan_data(extracted_data)
        
        return validated_data
    
    def extract_fallback_data(self, text):
        """Extraction avec patterns génériques"""
        data = {}
        
        # Numéros CNIE
        cnie_pattern = r'([A-Z]{1,2}[0-9]{6,8})'
        cnie_matches = re.findall(cnie_pattern, text)
        if cnie_matches and 'idNumber' not in data:
            data['idNumber'] = cnie_matches[0]
        
        # Dates
        date_pattern = r'([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
        dates = re.findall(date_pattern, text)
        if dates:
            if 'birthDate' not in data:
                data['birthDate'] = self.format_moroccan_date(dates[0])
            if len(dates) > 1 and 'expiryDate' not in data:
                data['expiryDate'] = self.format_moroccan_date(dates[1])
        
        # Noms (séquences de mots capitalisés)
        name_pattern = r'([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+){1,3})'
        names = re.findall(name_pattern, text)
        if names and 'fullName' not in data:
            data['fullName'] = max(names, key=len)  # Le plus long
        
        # Villes marocaines
        if 'birthPlace' not in data:
            for city in self.moroccan_cities:
                if city.upper() in text.upper():
                    data['birthPlace'] = city
                    break
        
        return data
    
    def format_moroccan_date(self, date_str):
        """Formatage des dates marocaines"""
        try:
            cleaned = re.sub(r'[^\d\/\-\.]', '', date_str)
            parts = re.split(r'[\/\-\.]', cleaned)
            
            if len(parts) == 3:
                day, month, year = parts
                
                # Gestion années courtes
                if len(year) == 2:
                    current_year = datetime.now().year
                    cutoff = current_year - 2000 + 10
                    year = f"19{year}" if int(year) > cutoff else f"20{year}"
                
                # Format ISO
                day = day.zfill(2)
                month = month.zfill(2)
                
                # Validation
                if int(day) <= 31 and int(month) <= 12:
                    return f"{year}-{month}-{day}"
            
            return date_str
        except:
            return date_str
    
    def format_moroccan_name(self, name):
        """Formatage des noms marocains"""
        # Nettoyage pour caractères arabes et latins
        cleaned = re.sub(r'[^\u0600-\u06FF\u0000-\u007F\s-]', '', name)
        
        words = cleaned.split()
        formatted_words = []
        
        for word in words:
            if re.search(r'[\u0600-\u06FF]', word):
                # Mot arabe - garder tel quel
                formatted_words.append(word)
            else:
                # Mot latin - capitaliser
                formatted_words.append(word.capitalize())
        
        return ' '.join(formatted_words).strip()
    
    def validate_moroccan_city(self, city):
        """Validation des villes marocaines"""
        cleaned = city.strip().upper()
        
        # Recherche exacte
        for moroccan_city in self.moroccan_cities:
            if moroccan_city.upper() == cleaned:
                return moroccan_city
        
        # Recherche partielle
        for moroccan_city in self.moroccan_cities:
            if (moroccan_city.upper() in cleaned or 
                cleaned in moroccan_city.upper()):
                return moroccan_city
        
        return city
    
    def standardize_nationality(self, nationality, language='fr'):
        """Standardisation de la nationalité"""
        n = nationality.lower().strip()
        
        if any(word in n for word in ['maroc', 'مغرب', 'moroccan']):
            return 'مغربية' if language == 'ar' else 'Marocaine'
        
        return nationality
    
    def format_gender(self, gender):
        """Formatage du sexe"""
        g = gender.lower()
        if any(char in g for char in ['m', 'ذكر', 'male']):
            return 'M'
        elif any(char in g for char in ['f', 'أنثى', 'female']):
            return 'F'
        return gender
    
    def validate_moroccan_data(self, data):
        """Validation spécialisée des données marocaines"""
        validated = data.copy()
        
        # Validation CNIE
        if 'idNumber' in validated:
            cnie_regex = r'^[A-Z]{1,2}[0-9]{6,8}$'
            if not re.match(cnie_regex, validated['idNumber']):
                # Tentative de correction
                match = re.search(r'([A-Z]{1,2}[0-9]{6,8})', validated['idNumber'])
                if match:
                    validated['idNumber'] = match.group(1)
        
        # Validation dates
        if 'birthDate' in validated:
            try:
                birth_year = int(validated['birthDate'].split('-')[0])
                current_year = datetime.now().year
                if birth_year < 1920 or birth_year > current_year:
                    print(f"Année de naissance suspecte: {birth_year}")
            except:
                pass
        
        # Nationalité par défaut
        if 'nationality' not in validated:
            validated['nationality'] = 'Marocaine'
        
        return validated
    
    def save_to_database(self, data, confidence):
        """Sauvegarder dans la base de données"""
        try:
            conn = sqlite3.connect('cnie_database.db')
            cursor = conn.cursor()
            
            # Vérifier si l'ID existe déjà
            cursor.execute(
                "SELECT id FROM cnie_records WHERE id_number = ?", 
                (data.get('idNumber'),)
            )
            existing = cursor.fetchone()
            
            if existing:
                # Mettre à jour
                cursor.execute('''
                    UPDATE cnie_records SET 
                    full_name = ?, birth_date = ?, birth_place = ?, 
                    nationality = ?, gender = ?, expiry_date = ?, 
                    address = ?, confidence = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id_number = ?
                ''', (
                    data.get('fullName'), data.get('birthDate'), data.get('birthPlace'),
                    data.get('nationality'), data.get('gender'), data.get('expiryDate'),
                    data.get('address'), confidence, data.get('idNumber')
                ))
                record_id = existing[0]
            else:
                # Insérer nouveau
                cursor.execute('''
                    INSERT INTO cnie_records 
                    (full_name, id_number, birth_date, birth_place, nationality, 
                     gender, expiry_date, address, confidence)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('fullName'), data.get('idNumber'), data.get('birthDate'),
                    data.get('birthPlace'), data.get('nationality'), data.get('gender'),
                    data.get('expiryDate'), data.get('address'), confidence
                ))
                record_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            return {'success': True, 'record_id': record_id}
            
        except Exception as e:
            print(f"Erreur sauvegarde: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_all_records(self):
        """Récupérer tous les enregistrements"""
        try:
            conn = sqlite3.connect('cnie_database.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, full_name, id_number, birth_date, birth_place, 
                       nationality, gender, expiry_date, address, confidence,
                       created_at, updated_at
                FROM cnie_records 
                ORDER BY created_at DESC
            ''')
            
            records = cursor.fetchall()
            conn.close()
            
            # Convertir en liste de dictionnaires
            columns = ['id', 'fullName', 'idNumber', 'birthDate', 'birthPlace',
                      'nationality', 'gender', 'expiryDate', 'address', 'confidence',
                      'createdAt', 'updatedAt']
            
            return [dict(zip(columns, record)) for record in records]
            
        except Exception as e:
            print(f"Erreur récupération: {e}")
            return []
    
    def delete_record(self, record_id):
        """Supprimer un enregistrement"""
        try:
            conn = sqlite3.connect('cnie_database.db')
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM cnie_records WHERE id = ?", (record_id,))
            
            conn.commit()
            conn.close()
            
            return {'success': True}
            
        except Exception as e:
            print(f"Erreur suppression: {e}")
            return {'success': False, 'error': str(e)}
    
    def export_to_excel(self):
        """Exporter vers Excel"""
        try:
            records = self.get_all_records()
            if not records:
                return None
            
            # Créer DataFrame
            df = pd.DataFrame(records)
            
            # Renommer les colonnes en français/arabe
            df = df.rename(columns={
                'fullName': 'Nom complet / الاسم الكامل',
                'idNumber': 'CNIE / رقم البطاقة',
                'birthDate': 'Date naissance / تاريخ الازدياد',
                'birthPlace': 'Lieu naissance / مكان الازدياد',
                'nationality': 'Nationalité / الجنسية',
                'gender': 'Sexe / الجنس',
                'expiryDate': 'Date expiration / انتهاء الصلاحية',
                'address': 'Adresse / العنوان',
                'confidence': 'Confiance OCR',
                'createdAt': 'Date création'
            })
            
            # Sélectionner les colonnes importantes
            export_columns = [
                'Nom complet / الاسم الكامل', 'CNIE / رقم البطاقة',
                'Date naissance / تاريخ الازدياد', 'Lieu naissance / مكان الازدياد',
                'Nationalité / الجنسية', 'Sexe / الجنس',
                'Date expiration / انتهاء الصلاحية', 'Adresse / العنوان',
                'Confiance OCR', 'Date création'
            ]
            
            df_export = df[export_columns]
            
            # Exporter vers Excel
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'base_donnees_cnie_maroc_{timestamp}.xlsx'
            filepath = os.path.join('exports', filename)
            
            os.makedirs('exports', exist_ok=True)
            df_export.to_excel(filepath, index=False, engine='openpyxl')
            
            return filepath
            
        except Exception as e:
            print(f"Erreur export: {e}")
            return None
    
    def advanced_extraction_fallback(self, text):
        """Méthode d'extraction avancée avec fallback intelligent"""
        extracted_data = {}
        
        # 1. Extraction agressive des numéros CNIE
        cnie_patterns = [
            r'([A-Z]{1,2}[0-9]{6,8})',
            r'([A-Z][0-9]{6,7})',
            r'([0-9]{6,8}[A-Z]{1,2})',
            r'CNIE\s*:?\s*([A-Z0-9]+)',
            r'ID\s*:?\s*([A-Z0-9]+)'
        ]
        
        for pattern in cnie_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Valider que c'est un format CNIE valide
                for match in matches:
                    if re.match(r'^[A-Z]{1,2}[0-9]{6,8}$', match):
                        extracted_data['idNumber'] = match
                        break
                if 'idNumber' in extracted_data:
                    break
        
        # 2. Extraction agressive des dates
        date_patterns = [
            r'([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})',
            r'([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2})',
            r'([0-9]{1,2}\s+[0-9]{1,2}\s+[0-9]{4})',
            r'([0-9]{2,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,2})'
        ]
        
        all_dates = []
        for pattern in date_patterns:
            dates = re.findall(pattern, text)
            all_dates.extend(dates)
        
        # Tri des dates par validité
        valid_dates = []
        for date in all_dates:
            formatted_date = self.format_moroccan_date(date)
            if formatted_date:
                valid_dates.append(formatted_date)
        
        if valid_dates:
            if 'birthDate' not in extracted_data:
                extracted_data['birthDate'] = valid_dates[0]
            if len(valid_dates) > 1 and 'expiryDate' not in extracted_data:
                extracted_data['expiryDate'] = valid_dates[1]
        
        # 3. Extraction de noms (mots capitalisés consécutifs)
        name_patterns = [
            r'([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ][a-záéèêëïîôùûüÿç]+){1,4})',
            r'([A-Z]+(?:\s+[A-Z]+){1,3})',
            r'([A-Za-z]+(?:\s+[A-Za-z]+){2,4})'
        ]
        
        potential_names = []
        for pattern in name_patterns:
            names = re.findall(pattern, text)
            potential_names.extend(names)
        
        # Filtrer les noms valides
        for name in potential_names:
            if len(name.split()) >= 2 and len(name) >= 5:
                # Éviter les mots communs
                if not any(word.lower() in ['carte', 'nationale', 'identite', 'royaume', 'maroc'] 
                          for word in name.split()):
                    if 'fullName' not in extracted_data:
                        extracted_data['fullName'] = self.format_moroccan_name(name)
                        break
        
        # 4. Détection de villes marocaines
        if 'birthPlace' not in extracted_data:
            text_upper = text.upper()
            for city in self.moroccan_cities:
                if city.upper() in text_upper:
                    extracted_data['birthPlace'] = city
                    break
        
        # 5. Détection du genre
        gender_indicators = {
            'M': ['MASCULIN', 'MALE', 'M', 'HOMME'],
            'F': ['FEMININ', 'FEMALE', 'F', 'FEMME']
        }
        
        text_upper = text.upper()
        for gender, indicators in gender_indicators.items():
            for indicator in indicators:
                if indicator in text_upper:
                    extracted_data['gender'] = gender
                    break
            if 'gender' in extracted_data:
                break
        
        return extracted_data
    
    def diagnose_extraction_issues(self, image_path):
        """Diagnostic complet des problèmes d'extraction"""
        diagnosis = {
            'image_readable': False,
            'ocr_working': False,
            'text_extracted': False,
            'patterns_working': False,
            'recommendations': []
        }
        
        try:
            # Test 1: Image lisible
            img = Image.open(image_path)
            diagnosis['image_readable'] = True
            
            # Test 2: OCR fonctionne
            basic_text = pytesseract.image_to_string(img)
            if basic_text.strip():
                diagnosis['ocr_working'] = True
                diagnosis['text_extracted'] = True
                
                # Test 3: Patterns fonctionnent
                test_extraction = self.advanced_extraction_fallback(basic_text)
                if test_extraction:
                    diagnosis['patterns_working'] = True
                else:
                    diagnosis['recommendations'].append("Améliorer les patterns de reconnaissance")
            else:
                diagnosis['recommendations'].append("OCR ne détecte aucun texte - vérifier la qualité de l'image")
                
                # Test avec prétraitement
                processed_img = self.preprocess_image(image_path)
                processed_text = pytesseract.image_to_string(Image.open(processed_img))
                if processed_text.strip():
                    diagnosis['recommendations'].append("Le prétraitement améliore la reconnaissance")
                
        except Exception as e:
            diagnosis['recommendations'].append(f"Erreur technique: {e}")
        
        return diagnosis

    def extract_cnie_data(self, image_path):
        """Fonction principale d'extraction de données CNIE"""
        try:
            print(f"🔍 Extraction des données de: {os.path.basename(image_path)}")
            
            # 1. Extraction du texte avec OCR
            text, confidence = self.extract_text_from_image(image_path)
            print(f"📝 Texte extrait ({confidence:.1f}% confiance): {text[:100]}...")
            
            if not text.strip():
                print("❌ Aucun texte détecté par OCR")
                return {}
            
            # 2. Extraction avec patterns marocains
            extracted_data = self.extract_moroccan_data(text, 'fr')
            print(f"🎯 Extraction normale: {len(extracted_data)} champs")
            
            # 3. Extraction fallback si peu de données
            if len(extracted_data) < 3:
                print("🔄 Utilisation de l'extraction fallback...")
                fallback_data = self.advanced_extraction_fallback(text)
                extracted_data.update(fallback_data)
                print(f"🎯 Après fallback: {len(extracted_data)} champs")
            
            # 4. Validation et formatage final
            final_data = self.validate_moroccan_data(extracted_data)
            
            # 5. Sauvegarde en base si données valides
            if final_data.get('idNumber'):
                self.save_to_database(final_data)
                print(f"💾 Données sauvegardées: {final_data.get('idNumber')}")
            
            return final_data
            
        except Exception as e:
            print(f"❌ Erreur extraction: {e}")
            import traceback
            traceback.print_exc()
            return {}

# Instance globale
extractor = MoroccanCNIEExtractor()

# Routes Flask
@app.route('/')
def index():
    """Page principale"""
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload et traitement de fichier"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        language = request.form.get('language', 'fr')
        
        if file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        if file:
            # Sécuriser le nom de fichier
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Sauvegarder le fichier
            file.save(filepath)
            
            # Extraire le texte
            text, confidence = extractor.extract_text_from_image(filepath)
            
            # Extraire les données structurées
            extracted_data = extractor.extract_moroccan_data(text, language)
            
            return jsonify({
                'success': True,
                'data': extracted_data,
                'confidence': confidence,
                'raw_text': text
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_record():
    """Sauvegarder un enregistrement"""
    try:
        data = request.json
        confidence = data.get('confidence', 0)
        
        # Nettoyer les données
        record_data = {
            'fullName': data.get('fullName', ''),
            'idNumber': data.get('idNumber', ''),
            'birthDate': data.get('birthDate', ''),
            'birthPlace': data.get('birthPlace', ''),
            'nationality': data.get('nationality', ''),
            'gender': data.get('gender', ''),
            'expiryDate': data.get('expiryDate', ''),
            'address': data.get('address', '')
        }
        
        result = extractor.save_to_database(record_data, confidence)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/records', methods=['GET'])
def get_records():
    """Récupérer tous les enregistrements"""
    try:
        records = extractor.get_all_records()
        return jsonify({'records': records})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/records/<int:record_id>', methods=['DELETE'])
def delete_record(record_id):
    """Supprimer un enregistrement"""
    try:
        result = extractor.delete_record(record_id)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export')
def export_excel():
    """Exporter vers Excel"""
    try:
        filepath = extractor.export_to_excel()
        
        if filepath and os.path.exists(filepath):
            return send_file(
                filepath,
                as_attachment=True,
                download_name=os.path.basename(filepath),
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            return jsonify({'error': 'Aucune donnée à exporter'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search')
def search_records():
    """Rechercher dans les enregistrements"""
    try:
        query = request.args.get('q', '').lower()
        records = extractor.get_all_records()
        
        if query:
            filtered_records = []
            for record in records:
                # Rechercher dans tous les champs texte
                searchable_text = ' '.join([
                    str(record.get('fullName', '')),
                    str(record.get('idNumber', '')),
                    str(record.get('birthPlace', '')),
                    str(record.get('nationality', ''))
                ]).lower()
                
                if query in searchable_text:
                    filtered_records.append(record)
            
            return jsonify({'records': filtered_records})
        else:
            return jsonify({'records': records})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes API pour tests et diagnostics
@app.route('/api/test-ocr', methods=['POST'])
def api_test_ocr():
    """Test basique de l'OCR"""
    try:
        # Créer une image de test
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (300, 100), color='white')
        draw = ImageDraw.Draw(img)
        draw.text((20, 30), "Test OCR CNIE A123456", fill='black')
        
        # Test OCR
        text = pytesseract.image_to_string(img)
        
        return jsonify({
            'success': True,
            'text': text.strip(),
            'length': len(text.strip())
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/test-extraction', methods=['POST'])
def api_test_extraction():
    """Test d'extraction avec une image synthétique"""
    try:
        extractor = MoroccanCNIEExtractor()
        
        # Prendre la première image synthétique
        synthetic_dir = os.path.join(os.getcwd(), 'synthetic_images')
        images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')]
        
        if not images:
            return jsonify({'success': False, 'error': 'Aucune image synthétique trouvée'}), 404
        
        test_image = os.path.join(synthetic_dir, images[0])
        data = extractor.extract_cnie_data(test_image)
        
        return jsonify({
            'success': True,
            'image': images[0],
            'data': data,
            'field_count': len([v for v in data.values() if v])
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/test-multiple', methods=['POST'])
def api_test_multiple():
    """Test avec plusieurs images"""
    try:
        extractor = MoroccanCNIEExtractor()
        synthetic_dir = os.path.join(os.getcwd(), 'synthetic_images')
        images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')][:5]
        
        results = []
        for img_file in images:
            try:
                img_path = os.path.join(synthetic_dir, img_file)
                data = extractor.extract_cnie_data(img_path)
                field_count = len([v for v in data.values() if v])
                
                results.append({
                    'file': img_file,
                    'field_count': field_count,
                    'data': data,
                    'success': True
                })
            except Exception as e:
                results.append({
                    'file': img_file,
                    'field_count': 0,
                    'data': {},
                    'success': False,
                    'error': str(e)
                })
        
        successful = len([r for r in results if r['success'] and r['field_count'] > 0])
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': {
                'total': len(results),
                'successful': successful,
                'success_rate': successful / len(results) * 100 if results else 0
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/list-images')
def api_list_images():
    """Liste des images synthétiques disponibles"""
    try:
        synthetic_dir = os.path.join(os.getcwd(), 'synthetic_images')
        images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')]
        
        return jsonify({
            'success': True,
            'images': sorted(images)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/extract-image', methods=['POST'])
def api_extract_image():
    """Extraction pour une image spécifique"""
    try:
        data = request.get_json()
        image_name = data.get('image_name')
        
        if not image_name:
            return jsonify({'success': False, 'error': 'Nom d\'image requis'}), 400
        
        synthetic_dir = os.path.join(os.getcwd(), 'synthetic_images')
        image_path = os.path.join(synthetic_dir, image_name)
        
        if not os.path.exists(image_path):
            return jsonify({'success': False, 'error': 'Image non trouvée'}), 404
        
        extractor = MoroccanCNIEExtractor()
        extracted_data = extractor.extract_cnie_data(image_path)
        
        return jsonify({
            'success': True,
            'image': image_name,
            'data': extracted_data,
            'field_count': len([v for v in extracted_data.values() if v])
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/synthetic_images/<filename>')
def serve_synthetic_image(filename):
    """Servir les images synthétiques"""
    return send_file(os.path.join('synthetic_images', filename))

@app.route('/test')
def test_interface():
    """Interface de test"""
    return send_file('test_interface.html')

if __name__ == '__main__':
    # Créer les dossiers nécessaires
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('exports', exist_ok=True)
    
    print("🇲🇦 Serveur AI CNIE Extractor démarré!")
    print("📋 Fonctionnalités:")
    print("   - OCR multilingue (FR/AR/EN)")
    print("   - Extraction automatique cartes marocaines")
    print("   - Base de données SQLite")
    print("   - Export Excel")
    print("   - API REST complète")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
