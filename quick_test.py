#!/usr/bin/env python3
"""
Script de test simple et rapide
"""
import os
import sys
sys.path.append('/workspaces/abdou3a.github.io')

def quick_test():
    try:
        from app import MoroccanCNIEExtractor
        print("✅ Import réussi")
        
        extractor = MoroccanCNIEExtractor()
        print("✅ Extracteur créé")
        
        # Test avec la première image disponible
        test_image = "/workspaces/abdou3a.github.io/synthetic_images/cnie_A246504.png"
        if not os.path.exists(test_image):
            print("❌ Image de test non trouvée")
            return
        
        print(f"🔍 Test avec: {test_image}")
        result = extractor.extract_cnie_data(test_image)
        print(f"✅ Extraction réussie: {result}")
        
        # Test avec l'extraction avancée
        from PIL import Image
        import pytesseract
        img = Image.open(test_image)
        text = pytesseract.image_to_string(img)
        
        fallback = extractor.advanced_extraction_fallback(text)
        print(f"✅ Extraction fallback: {fallback}")
        
        return result
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    quick_test()
