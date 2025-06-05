#!/usr/bin/env python3
"""
Script de démarrage pour l'extracteur CNIE
"""
import os
import sys
import subprocess
import time

def check_dependencies():
    """Vérifier les dépendances"""
    print("🔍 Vérification des dépendances...")
    
    try:
        import flask
        import pytesseract
        import cv2
        import PIL
        print("✅ Toutes les dépendances sont installées")
        return True
    except ImportError as e:
        print(f"❌ Dépendance manquante: {e}")
        return False

def start_application():
    """Démarrer l'application Flask"""
    print("🚀 Démarrage de l'extracteur CNIE...")
    
    if not check_dependencies():
        print("❌ Impossible de démarrer - dépendances manquantes")
        return False
    
    try:
        # Test rapide de l'extracteur
        sys.path.append('/workspaces/abdou3a.github.io')
        from app import MoroccanCNIEExtractor
        extractor = MoroccanCNIEExtractor()
        print("✅ Extracteur initialisé")
        
        # Démarrer Flask
        os.environ['FLASK_APP'] = 'app.py'
        os.environ['FLASK_ENV'] = 'development'
        
        print("🌐 Démarrage du serveur Flask...")
        print("📍 Interface disponible sur:")
        print("   - Application principale: http://localhost:5000")
        print("   - Interface de test: http://localhost:5000/test")
        print("   - API: http://localhost:5000/api/")
        
        # Lancer Flask
        subprocess.run([
            sys.executable, '-m', 'flask', 'run', 
            '--host=0.0.0.0', '--port=5000', '--debug'
        ])
        
    except Exception as e:
        print(f"❌ Erreur démarrage: {e}")
        return False

if __name__ == "__main__":
    start_application()
