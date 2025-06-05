#!/usr/bin/env python3
"""
Script de test des dépendances
"""
import sys

def test_import(module_name, package_name=None):
    try:
        __import__(module_name)
        print(f"✅ {module_name} - OK")
        return True
    except ImportError as e:
        print(f"❌ {module_name} - ERREUR: {e}")
        if package_name:
            print(f"   Installer avec: pip install {package_name}")
        return False

def main():
    print("Test des dépendances pour l'extracteur de cartes d'identité")
    print("=" * 60)
    
    modules = [
        ("flask", "flask"),
        ("cv2", "opencv-python"),
        ("PIL", "pillow"),
        ("pytesseract", "pytesseract"),
        ("numpy", "numpy"),
        ("werkzeug", "werkzeug"),
        ("sqlite3", None),  # Module standard
    ]
    
    all_ok = True
    for module, package in modules:
        if not test_import(module, package):
            all_ok = False
    
    print("=" * 60)
    if all_ok:
        print("✅ Toutes les dépendances sont installées !")
    else:
        print("❌ Certaines dépendances manquent.")
    
    # Test Tesseract
    print("\nTest de Tesseract OCR:")
    try:
        import pytesseract
        import PIL.Image
        
        # Créer une image de test simple
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGB', (200, 50), color='white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 10), "TEST", fill='black')
        
        text = pytesseract.image_to_string(img)
        print(f"✅ Tesseract fonctionne - Texte détecté: '{text.strip()}'")
    except Exception as e:
        print(f"❌ Tesseract - ERREUR: {e}")

if __name__ == "__main__":
    main()
