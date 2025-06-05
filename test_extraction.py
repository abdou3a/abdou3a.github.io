#!/usr/bin/env python3
"""
Script de diagnostic pour l'extraction de données CNIE
"""
import os
import sys
sys.path.append('/workspaces/abdou3a.github.io')

from app import MoroccanCNIEExtractor
import pytesseract
from PIL import Image
import cv2

def test_ocr_basic():
    """Test basique de l'OCR"""
    print("🔍 Test OCR basique...")
    
    try:
        # Test avec une image simple
        from PIL import Image, ImageDraw, ImageFont
        
        # Créer une image de test
        img = Image.new('RGB', (400, 100), color='white')
        draw = ImageDraw.Draw(img)
        
        # Texte de test CNIE
        test_text = "Nom: AHMED BENALI\nCNIE: A123456\nNé le: 15/03/1985"
        draw.text((10, 10), test_text, fill='black')
        
        # Sauvegarder l'image
        test_path = "/workspaces/abdou3a.github.io/test_image.png"
        img.save(test_path)
        
        # Test OCR
        text = pytesseract.image_to_string(img, lang='fra+eng')
        print(f"✅ Texte extrait: {repr(text)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur OCR: {e}")
        return False

def test_tesseract_langs():
    """Test des langues Tesseract disponibles"""
    print("\n🌐 Test des langues Tesseract...")
    
    try:
        langs = pytesseract.get_languages()
        print(f"Langues disponibles: {langs}")
        
        required_langs = ['eng', 'fra', 'ara']
        missing_langs = [lang for lang in required_langs if lang not in langs]
        
        if missing_langs:
            print(f"❌ Langues manquantes: {missing_langs}")
            return False
        else:
            print("✅ Toutes les langues requises sont disponibles")
            return True
            
    except Exception as e:
        print(f"❌ Erreur test langues: {e}")
        return False

def test_synthetic_image():
    """Test avec une image synthétique existante"""
    print("\n🖼️ Test avec image synthétique...")
    
    synthetic_dir = "/workspaces/abdou3a.github.io/synthetic_images"
    if not os.path.exists(synthetic_dir):
        print("❌ Dossier synthetic_images introuvable")
        return False
    
    # Prendre la première image
    images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')]
    if not images:
        print("❌ Aucune image synthétique trouvée")
        return False
    
    test_image = os.path.join(synthetic_dir, images[0])
    print(f"Test avec: {test_image}")
    
    try:
        # Test OCR direct
        text = pytesseract.image_to_string(Image.open(test_image), lang='fra+eng+ara')
        print(f"Texte OCR brut: {repr(text[:200])}")
        
        # Test avec l'extracteur
        extractor = MoroccanCNIEExtractor()
        extracted_text, confidence = extractor.extract_text_from_image(test_image)
        print(f"Texte extrait: {repr(extracted_text[:200])}")
        print(f"Confiance: {confidence}")
        
        # Test extraction de données
        data = extractor.extract_cnie_data(test_image)
        print(f"Données extraites: {data}")
        
        return len(data) > 0
        
    except Exception as e:
        print(f"❌ Erreur test image synthétique: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_image_processing():
    """Test du prétraitement d'image"""
    print("\n🔧 Test prétraitement d'image...")
    
    try:
        synthetic_dir = "/workspaces/abdou3a.github.io/synthetic_images"
        images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')]
        
        if not images:
            print("❌ Aucune image à traiter")
            return False
        
        test_image = os.path.join(synthetic_dir, images[0])
        
        # Test de prétraitement
        extractor = MoroccanCNIEExtractor()
        processed_path = extractor.preprocess_image(test_image)
        
        if os.path.exists(processed_path):
            print(f"✅ Image prétraitée créée: {processed_path}")
            
            # Comparer OCR avant/après
            original_text = pytesseract.image_to_string(Image.open(test_image))
            processed_text = pytesseract.image_to_string(Image.open(processed_path))
            
            print(f"Longueur texte original: {len(original_text)}")
            print(f"Longueur texte traité: {len(processed_text)}")
            
            return True
        else:
            print("❌ Fichier prétraité non créé")
            return False
            
    except Exception as e:
        print(f"❌ Erreur prétraitement: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Diagnostic de l'extracteur CNIE Marocain")
    print("=" * 50)
    
    tests = [
        ("OCR basique", test_ocr_basic),
        ("Langues Tesseract", test_tesseract_langs),
        ("Prétraitement image", test_image_processing),
        ("Image synthétique", test_synthetic_image),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 20)
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur dans {test_name}: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("RÉSUMÉ DES TESTS:")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    failed_tests = [name for name, result in results if not result]
    if failed_tests:
        print(f"\n❌ Tests échoués: {', '.join(failed_tests)}")
        print("\nRecommandations:")
        print("1. Vérifier l'installation de Tesseract")
        print("2. Installer les packs de langue manquants")
        print("3. Vérifier les patterns de reconnaissance")
    else:
        print("\n✅ Tous les tests passent !")

if __name__ == "__main__":
    main()
