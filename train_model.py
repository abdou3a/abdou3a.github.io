import os
import json
import requests
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import pytesseract
import re
from typing import Dict, List, Tuple
import sqlite3
from datetime import datetime, timedelta
import random

class CNIETrainingSystem:
    def __init__(self):
        self.training_data = []
        self.moroccan_names = [
            "MOHAMMED HASSAN", "FATIMA ZAHRA", "AHMED BENALI", "AICHA IDRISSI",
            "YOUSSEF ALAMI", "KHADIJA BENNANI", "OMAR TAZI", "ZINEB FASSI",
            "RACHID CHRAIBI", "MALIKA BERRADA", "KHALID REGRAGUI", "NAJWA SQUALLI",
            "ABDELLAH BOUAZZA", "SAMIRA NACIRI", "MUSTAPHA BELKADI", "LOUBNA KETTANI",
            "محمد حسان", "فاطمة الزهراء", "أحمد بنعلي", "عائشة الإدريسي",
            "يوسف العلمي", "خديجة البناني", "عمر التازي", "زينب الفاسي"
        ]
        
        self.moroccan_cities = [
            "CASABLANCA", "RABAT", "FES", "MARRAKECH", "AGADIR", "TANGIER",
            "MEKNES", "OUJDA", "KENITRA", "TETOUAN", "SAFI", "MOHAMMEDIA",
            "الدار البيضاء", "الرباط", "فاس", "مراكش", "أكادير", "طنجة"
        ]
        
        # Patterns améliorés après analyse d'exemples
        self.enhanced_patterns = {
            'fr': {
                'fullName': [
                    r'(?:NOM\s*ET\s*PRENOM|NOM|PRENOM)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)',
                    r'([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]+(?:\s+[A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ]+){1,4})',
                    r'(?:TITULAIRE|BENEFICIAIRE)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)'
                ],
                'idNumber': [
                    r'(?:N°|NUM|NUMERO|CARTE\s*NATIONALE|CNIE)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})',
                    r'([A-Z]{1,2}[0-9]{6,8})',
                    r'(?:ID|IDENTIFIANT)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})'
                ],
                'birthDate': [
                    r'(?:NE\s*LE|NAISSANCE|DATE\s*DE\s*NAISSANCE|NEE?\s*LE?)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                    r'(?:DATE\s*NAISS|D\.NAISS)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                    r'([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})'
                ],
                'birthPlace': [
                    r'(?:NE\s*A|LIEU\s*DE\s*NAISSANCE|A)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)',
                    r'(?:LIEU\s*NAISS|L\.NAISS)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)'
                ]
            },
            'ar': {
                'fullName': [
                    r'(?:الاسم\s*الكامل|الاسم\s*و\s*النسب|الإسم)\s*:?\s*([\u0600-\u06FF\s]+)',
                    r'(?:صاحب\s*البطاقة|المستفيد)\s*:?\s*([\u0600-\u06FF\s]+)'
                ],
                'idNumber': [
                    r'(?:رقم\s*البطاقة|ب\.و\.ت\.م|بطاقة\s*التعريف)\s*:?\s*([A-Z]{1,2}[0-9]{6,8})',
                    r'([A-Z]{1,2}[0-9]{6,8})'
                ],
                'birthDate': [
                    r'(?:تاريخ\s*الازدياد|مولود\s*في|الازدياد)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
                    r'(?:ت\.الازدياد)\s*:?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
                ],
                'birthPlace': [
                    r'(?:مكان\s*الازدياد|مولود\s*ب|بـ)\s*:?\s*([\u0600-\u06FF\s]+)',
                    r'(?:م\.الازدياد)\s*:?\s*([\u0600-\u06FF\s]+)'
                ]
            }
        }
        
        self.init_training_db()
    
    def init_training_db(self):
        """Initialiser la base de données d'entraînement"""
        conn = sqlite3.connect('training_data.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS training_samples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_path TEXT,
                extracted_text TEXT,
                ground_truth JSON,
                confidence REAL,
                language TEXT,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pattern_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_type TEXT,
                pattern TEXT,
                success_rate REAL,
                total_tests INTEGER,
                successful_extractions INTEGER,
                language TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def download_sample_images(self):
        """Télécharger des images d'exemple (utiliser des images libres de droits)"""
        sample_urls = [
            # URLs d'exemples de cartes (remplacer par de vraies URLs d'images libres)
            "https://example.com/sample_id_1.jpg",
            "https://example.com/sample_id_2.jpg"
        ]
        
        os.makedirs('training_images', exist_ok=True)
        
        for i, url in enumerate(sample_urls):
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    filename = f'training_images/sample_{i+1}.jpg'
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    print(f"✅ Image téléchargée: {filename}")
            except Exception as e:
                print(f"❌ Erreur téléchargement {url}: {e}")
    
    def generate_synthetic_cnie(self, data: Dict) -> str:
        """Générer une carte CNIE synthétique pour l'entraînement"""
        # Créer une image synthétique de carte CNIE
        width, height = 856, 540  # Taille standard carte ID
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        try:
            # Utiliser une police par défaut si Arial n'est pas disponible
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        except:
            font_large = font_medium = font_small = ImageFont.load_default()
        
        # Couleurs Maroc
        red_morocco = (200, 16, 46)
        green_morocco = (0, 98, 51)
        
        # Header avec drapeau stylisé
        draw.rectangle([0, 0, width, 80], fill=red_morocco)
        draw.text((20, 20), "ROYAUME DU MAROC", fill='white', font=font_large)
        draw.text((20, 45), "المملكة المغربية", fill='white', font=font_medium)
        
        # Titre CNIE
        draw.text((width//2 - 100, 100), "CARTE NATIONALE D'IDENTITÉ ÉLECTRONIQUE", 
                 fill=green_morocco, font=font_large)
        draw.text((width//2 - 80, 125), "البطاقة الوطنية للتعريف الإلكترونية", 
                 fill=green_morocco, font=font_medium)
        
        # Données personnelles
        y_offset = 180
        fields = [
            ("NOM ET PRENOM:", data.get('fullName', 'HASSAN MOHAMMED')),
            ("الاسم والنسب:", data.get('fullNameAr', 'حسان محمد')),
            ("N° CNIE:", data.get('idNumber', 'A123456789')),
            ("DATE DE NAISSANCE:", data.get('birthDate', '15/03/1990')),
            ("تاريخ الازدياد:", data.get('birthDateAr', '15/03/1990')),
            ("LIEU DE NAISSANCE:", data.get('birthPlace', 'CASABLANCA')),
            ("مكان الازدياد:", data.get('birthPlaceAr', 'الدار البيضاء')),
            ("NATIONALITÉ:", "MAROCAINE"),
            ("الجنسية:", "مغربية"),
            ("SEXE:", data.get('gender', 'M')),
            ("الجنس:", data.get('genderAr', 'ذكر')),
            ("DATE D'EXPIRATION:", data.get('expiryDate', '15/03/2030')),
            ("تاريخ الانتهاء:", data.get('expiryDate', '15/03/2030'))
        ]
        
        for label, value in fields:
            draw.text((50, y_offset), f"{label}", fill='black', font=font_small)
            draw.text((300, y_offset), value, fill='black', font=font_medium)
            y_offset += 25
        
        # Zone photo (rectangle gris)
        draw.rectangle([width-200, 150, width-50, 300], outline='gray', width=2)
        draw.text((width-175, 220), "PHOTO", fill='gray', font=font_medium)
        
        # Sauvegarder
        os.makedirs('synthetic_images', exist_ok=True)
        filename = f"synthetic_images/cnie_{data.get('idNumber', 'sample')}.png"
        img.save(filename)
        
        return filename
    
    def generate_training_dataset(self, num_samples: int = 100):
        """Générer un dataset d'entraînement synthétique"""
        print(f"🔄 Génération de {num_samples} échantillons d'entraînement...")
        
        for i in range(num_samples):
            # Générer des données aléatoires réalistes
            name = random.choice(self.moroccan_names)
            city = random.choice(self.moroccan_cities)
            
            # Générer CNIE valide
            prefix = random.choice(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'])
            number = f"{prefix}{random.randint(100000, 999999)}"
            
            # Date de naissance réaliste
            birth_year = random.randint(1960, 2005)
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)
            birth_date = f"{birth_day:02d}/{birth_month:02d}/{birth_year}"
            
            # Date d'expiration (10 ans après)
            expiry_year = birth_year + random.randint(30, 50)
            expiry_date = f"{birth_day:02d}/{birth_month:02d}/{expiry_year}"
            
            sample_data = {
                'fullName': name,
                'idNumber': number,
                'birthDate': birth_date,
                'birthPlace': city,
                'nationality': 'MAROCAINE',
                'gender': random.choice(['M', 'F']),
                'expiryDate': expiry_date
            }
            
            # Générer l'image synthétique
            image_path = self.generate_synthetic_cnie(sample_data)
            
            # Extraire le texte avec OCR
            extracted_text = self.extract_text_from_image(image_path)
            
            # Sauvegarder dans la base d'entraînement
            self.save_training_sample(image_path, extracted_text, sample_data, 
                                    confidence=95.0, language='fr', source='synthetic')
            
            if i % 10 == 0:
                print(f"✅ Généré {i+1}/{num_samples} échantillons")
        
        print(f"🎉 Dataset d'entraînement généré avec succès!")
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Extraire le texte d'une image"""
        try:
            # Configuration OCR optimisée
            config = '--oem 3 --psm 6 -l ara+fra+eng'
            text = pytesseract.image_to_string(Image.open(image_path), config=config)
            return text
        except Exception as e:
            print(f"Erreur OCR: {e}")
            return ""
    
    def save_training_sample(self, image_path: str, extracted_text: str, 
                           ground_truth: Dict, confidence: float, 
                           language: str, source: str):
        """Sauvegarder un échantillon d'entraînement"""
        try:
            conn = sqlite3.connect('training_data.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO training_samples 
                (image_path, extracted_text, ground_truth, confidence, language, source)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (image_path, extracted_text, json.dumps(ground_truth), 
                  confidence, language, source))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Erreur sauvegarde: {e}")
    
    def test_patterns_on_dataset(self):
        """Tester les patterns sur le dataset d'entraînement"""
        print("🧪 Test des patterns sur le dataset...")
        
        conn = sqlite3.connect('training_data.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM training_samples")
        samples = cursor.fetchall()
        
        pattern_stats = {}
        
        for sample in samples:
            _, image_path, extracted_text, ground_truth_json, _, language, _ = sample
            ground_truth = json.loads(ground_truth_json)
            
            # Tester chaque pattern
            for field_type in ['fullName', 'idNumber', 'birthDate', 'birthPlace']:
                if field_type in ground_truth:
                    expected_value = ground_truth[field_type]
                    
                    patterns = self.enhanced_patterns.get(language, {}).get(field_type, [])
                    
                    for pattern in patterns:
                        if pattern not in pattern_stats:
                            pattern_stats[pattern] = {
                                'total': 0, 'success': 0, 'field': field_type
                            }
                        
                        pattern_stats[pattern]['total'] += 1
                        
                        # Tester le pattern
                        match = re.search(pattern, extracted_text, re.IGNORECASE)
                        if match and self.normalize_text(match.group(1)) == self.normalize_text(expected_value):
                            pattern_stats[pattern]['success'] += 1
        
        # Sauvegarder les performances
        self.save_pattern_performance(pattern_stats)
        
        # Afficher les résultats
        self.display_pattern_performance(pattern_stats)
        
        conn.close()
    
    def normalize_text(self, text: str) -> str:
        """Normaliser le texte pour la comparaison"""
        return re.sub(r'\s+', ' ', text.strip().upper())
    
    def save_pattern_performance(self, pattern_stats: Dict):
        """Sauvegarder les performances des patterns"""
        conn = sqlite3.connect('training_data.db')
        cursor = conn.cursor()
        
        for pattern, stats in pattern_stats.items():
            success_rate = stats['success'] / stats['total'] if stats['total'] > 0 else 0
            
            cursor.execute('''
                INSERT OR REPLACE INTO pattern_performance 
                (pattern_type, pattern, success_rate, total_tests, successful_extractions, language)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (stats['field'], pattern, success_rate, stats['total'], 
                  stats['success'], 'fr'))
        
        conn.commit()
        conn.close()
    
    def display_pattern_performance(self, pattern_stats: Dict):
        """Afficher les performances des patterns"""
        print("\n📊 PERFORMANCES DES PATTERNS:")
        print("=" * 80)
        
        for field in ['fullName', 'idNumber', 'birthDate', 'birthPlace']:
            print(f"\n🔍 {field.upper()}:")
            field_patterns = [(p, s) for p, s in pattern_stats.items() 
                            if s['field'] == field]
            
            # Trier par taux de succès
            field_patterns.sort(key=lambda x: x[1]['success']/x[1]['total'], reverse=True)
            
            for pattern, stats in field_patterns[:3]:  # Top 3
                success_rate = stats['success'] / stats['total'] * 100
                print(f"   📈 {success_rate:.1f}% | {stats['success']}/{stats['total']} | {pattern[:50]}...")
    
    def get_best_patterns(self) -> Dict:
        """Récupérer les meilleurs patterns"""
        conn = sqlite3.connect('training_data.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT pattern_type, pattern, success_rate 
            FROM pattern_performance 
            WHERE success_rate = (
                SELECT MAX(success_rate) 
                FROM pattern_performance p2 
                WHERE p2.pattern_type = pattern_performance.pattern_type
            )
            ORDER BY pattern_type, success_rate DESC
        ''')
        
        best_patterns = {}
        for row in cursor.fetchall():
            field_type, pattern, success_rate = row
            if field_type not in best_patterns:
                best_patterns[field_type] = []
            best_patterns[field_type].append((pattern, success_rate))
        
        conn.close()
        return best_patterns
    
    def update_extraction_patterns(self):
        """Mettre à jour les patterns dans le système principal"""
        best_patterns = self.get_best_patterns()
        
        # Créer le fichier de patterns optimisés
        optimized_patterns = {
            'fr': {},
            'ar': {},
            'en': {}
        }
        
        for field_type, patterns in best_patterns.items():
            for lang in ['fr', 'ar', 'en']:
                optimized_patterns[lang][field_type] = [p[0] for p in patterns]
        
        # Sauvegarder les patterns optimisés
        with open('optimized_patterns.json', 'w', encoding='utf-8') as f:
            json.dump(optimized_patterns, f, ensure_ascii=False, indent=2)
        
        print("✅ Patterns optimisés sauvegardés dans optimized_patterns.json")
        
        return optimized_patterns
    
    def evaluate_model_performance(self):
        """Évaluer les performances globales du modèle"""
        conn = sqlite3.connect('training_data.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM training_samples")
        total_samples = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT AVG(success_rate), COUNT(*) 
            FROM pattern_performance 
            WHERE success_rate > 0.8
        ''')
        avg_success, high_perf_patterns = cursor.fetchone()
        
        print(f"\n📈 ÉVALUATION DU MODÈLE:")
        print(f"📊 Échantillons d'entraînement: {total_samples}")
        print(f"🎯 Patterns haute performance (>80%): {high_perf_patterns}")
        print(f"📈 Taux de succès moyen: {avg_success:.1%}" if avg_success else "📈 Pas encore de données")
        
        conn.close()
    
    def train_model(self):
        """Entraîner le modèle complet"""
        print("🚀 DÉMARRAGE DE L'ENTRAÎNEMENT DU MODÈLE CNIE")
        print("=" * 60)
        
        # 1. Générer le dataset synthétique
        self.generate_training_dataset(50)
        
        # 2. Tester les patterns
        self.test_patterns_on_dataset()
        
        # 3. Optimiser les patterns
        optimized_patterns = self.update_extraction_patterns()
        
        # 4. Évaluer les performances
        self.evaluate_model_performance()
        
        print("\n🎉 ENTRAÎNEMENT TERMINÉ AVEC SUCCÈS!")
        print("📁 Fichiers générés:")
        print("   - optimized_patterns.json")
        print("   - training_data.db")
        print("   - synthetic_images/")
        
        return optimized_patterns

def main():
    """Fonction principale d'entraînement"""
    trainer = CNIETrainingSystem()
    
    print("🇲🇦 SYSTÈME D'ENTRAÎNEMENT IA CNIE MAROC")
    print("=" * 50)
    
    # Entraîner le modèle
    optimized_patterns = trainer.train_model()
    
    # Afficher les meilleurs patterns
    print("\n🏆 MEILLEURS PATTERNS DÉCOUVERTS:")
    for field, patterns in optimized_patterns['fr'].items():
        print(f"\n{field}:")
        for i, pattern in enumerate(patterns[:2], 1):
            print(f"  {i}. {pattern}")

if __name__ == "__main__":
    main()
