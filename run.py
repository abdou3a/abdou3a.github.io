#!/usr/bin/env python3
"""
🇲🇦 AI CNIE Extractor Python
Extracteur intelligent de cartes d'identité marocaines
"""

import os
import sys

def check_dependencies():
    """Vérifier les dépendances"""
    try:
        import pytesseract
        import cv2
        import pandas
        from flask import Flask
        print("✅ Toutes les dépendances sont installées")
        return True
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        print("📦 Installez avec: pip install -r requirements.txt")
        return False

def setup_tesseract():
    """Configuration Tesseract"""
    print("🔧 Configuration Tesseract OCR...")
    
    # Vérifier si Tesseract est installé
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        print("✅ Tesseract OCR détecté")
    except:
        print("❌ Tesseract OCR non trouvé")
        print("📥 Installation requise:")
        print("   Ubuntu/Debian: sudo apt-get install tesseract-ocr tesseract-ocr-ara tesseract-ocr-fra")
        print("   MacOS: brew install tesseract tesseract-lang")
        print("   Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        return False
    
    return True

def main():
    """Fonction principale"""
    print("🇲🇦 Démarrage AI CNIE Extractor Python")
    print("=" * 50)
    
    # Vérifications
    if not check_dependencies():
        sys.exit(1)
    
    if not setup_tesseract():
        sys.exit(1)
    
    # Créer les dossiers
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('exports', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    print("📁 Dossiers créés")
    print("🚀 Lancement du serveur Flask...")
    print("🌐 URL: http://localhost:5000")
    print("=" * 50)
    
    # Lancer l'application
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Arrêt du serveur")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    main()
