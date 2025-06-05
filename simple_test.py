#!/usr/bin/env python3
"""
Test simple d'extraction avec une image synthétique
"""
import os
import sys
import cv2
import numpy as np
from PIL import Image
import pytesseract
import re

def test_simple_extraction():
    # Test avec la première image
    image_path = "/workspaces/abdou3a.github.io/synthetic_images/cnie_A246504.png"
    
    if not os.path.exists(image_path):
        print(f"Image non trouvée: {image_path}")
        return
    
    try:
        # 1. Test OCR basique
        print("🔍 Test OCR basique...")
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        print(f"Texte brut: {repr(text)}")
        print(f"Longueur: {len(text)} caractères")
        
        # 2. Test avec langues
        print("\n🌐 Test avec langues multiples...")
        try:
            text_multi = pytesseract.image_to_string(image, lang='fra+eng')
            print(f"Texte multilingue: {repr(text_multi)}")
        except Exception as e:
            print(f"Erreur langues: {e}")
        
        # 3. Test avec prétraitement OpenCV
        print("\n🔧 Test avec prétraitement...")
        try:
            # Charger avec OpenCV
            cv_img = cv2.imread(image_path)
            
            if cv_img is not None:
                # Convertir en gris
                gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
                
                # Améliorer le contraste
                enhanced = cv2.equalizeHist(gray)
                
                # Sauvegarder l'image traitée
                processed_path = "/tmp/processed_test.png"
                cv2.imwrite(processed_path, enhanced)
                
                # OCR sur image traitée
                processed_text = pytesseract.image_to_string(Image.open(processed_path))
                print(f"Texte après traitement: {repr(processed_text)}")
                
            else:
                print("Impossible de charger l'image avec OpenCV")
                
        except Exception as e:
            print(f"Erreur prétraitement: {e}")
        
        # 4. Test patterns CNIE
        print("\n🔍 Test extraction patterns...")
        full_text = text + " " + (text_multi if 'text_multi' in locals() else "")
        
        # Pattern CNIE
        cnie_pattern = r'([A-Z]{1,2}[0-9]{6,8})'
        cnie_matches = re.findall(cnie_pattern, full_text)
        print(f"CNIE trouvés: {cnie_matches}")
        
        # Pattern dates
        date_pattern = r'([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
        dates = re.findall(date_pattern, full_text)
        print(f"Dates trouvées: {dates}")
        
        # Pattern noms
        name_pattern = r'([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)'
        names = re.findall(name_pattern, full_text)
        print(f"Noms trouvés: {names}")
        
        return True
        
    except Exception as e:
        print(f"Erreur générale: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_simple_extraction()
