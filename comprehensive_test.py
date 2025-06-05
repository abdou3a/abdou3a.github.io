#!/usr/bin/env python3
"""
Script de test complet pour diagnostiquer et résoudre les problèmes d'extraction CNIE
"""
import os
import sys
import traceback
from PIL import Image
import pytesseract

# Ajouter le chemin du projet
sys.path.append('/workspaces/abdou3a.github.io')

from app import MoroccanCNIEExtractor

def test_basic_ocr():
    """Test OCR de base"""
    print("🔍 Test OCR de base...")
    
    try:
        # Créer une image de test simple
        img = Image.new('RGB', (400, 200), color='white')
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        
        # Texte de test
        test_lines = [
            "ROYAUME DU MAROC",
            "CARTE NATIONALE D'IDENTITE",
            "Nom: BENALI Ahmed",
            "CNIE: A123456",
            "Né le: 15/03/1985",
            "À: CASABLANCA"
        ]
        
        y_pos = 20
        for line in test_lines:
            draw.text((20, y_pos), line, fill='black')
            y_pos += 25
        
        # Test OCR
        text = pytesseract.image_to_string(img, lang='fra+eng')
        print(f"✅ OCR fonctionne. Texte détecté ({len(text)} chars):")
        print(f"   {repr(text[:100])}")
        
        return True, text
        
    except Exception as e:
        print(f"❌ Erreur OCR: {e}")
        return False, ""

def test_real_image():
    """Test avec une vraie image synthétique"""
    print("\n🖼️ Test avec image synthétique réelle...")
    
    # Prendre la première image disponible
    synthetic_dir = "/workspaces/abdou3a.github.io/synthetic_images"
    images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')]
    
    if not images:
        print("❌ Aucune image synthétique trouvée")
        return False, {}
    
    test_image = os.path.join(synthetic_dir, images[0])
    print(f"Test avec: {test_image}")
    
    try:
        extractor = MoroccanCNIEExtractor()
        
        # 1. Diagnostic complet
        diagnosis = extractor.diagnose_extraction_issues(test_image)
        print(f"Diagnostic:")
        for key, value in diagnosis.items():
            if key != 'recommendations':
                print(f"   {key}: {value}")
        
        if diagnosis['recommendations']:
            print("Recommandations:")
            for rec in diagnosis['recommendations']:
                print(f"   - {rec}")
        
        # 2. Test extraction normale
        data = extractor.extract_cnie_data(test_image)
        print(f"Données extraites (méthode normale): {data}")
        
        # 3. Test extraction avec OCR direct
        img = Image.open(test_image)
        raw_text = pytesseract.image_to_string(img, lang='fra+eng')
        print(f"Texte OCR brut: {repr(raw_text[:200])}")
        
        # 4. Test extraction fallback
        fallback_data = extractor.advanced_extraction_fallback(raw_text)
        print(f"Données extraites (fallback): {fallback_data}")
        
        return True, {**data, **fallback_data}
        
    except Exception as e:
        print(f"❌ Erreur test image: {e}")
        traceback.print_exc()
        return False, {}

def test_multiple_images():
    """Test avec plusieurs images pour statistiques"""
    print("\n📊 Test avec plusieurs images...")
    
    synthetic_dir = "/workspaces/abdou3a.github.io/synthetic_images"
    images = [f for f in os.listdir(synthetic_dir) if f.endswith('.png')][:5]  # Test 5 images
    
    extractor = MoroccanCNIEExtractor()
    results = []
    
    for img_file in images:
        img_path = os.path.join(synthetic_dir, img_file)
        print(f"Test: {img_file}")
        
        try:
            # Extraction standard
            data = extractor.extract_cnie_data(img_path)
            
            # Extraction fallback si peu de données
            if len(data) < 3:
                img = Image.open(img_path)
                raw_text = pytesseract.image_to_string(img, lang='fra+eng')
                fallback_data = extractor.advanced_extraction_fallback(raw_text)
                data.update(fallback_data)
            
            field_count = len([v for v in data.values() if v])
            print(f"   Champs extraits: {field_count}/7")
            print(f"   Données: {data}")
            
            results.append({
                'file': img_file,
                'field_count': field_count,
                'data': data
            })
            
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
            results.append({
                'file': img_file,
                'field_count': 0,
                'data': {},
                'error': str(e)
            })
    
    # Statistiques
    successful = [r for r in results if r['field_count'] > 0]
    print(f"\n📈 Statistiques:")
    print(f"Images testées: {len(results)}")
    print(f"Extractions réussies: {len(successful)}")
    print(f"Taux de succès: {len(successful)/len(results)*100:.1f}%")
    
    if successful:
        avg_fields = sum(r['field_count'] for r in successful) / len(successful)
        print(f"Champs moyens extraits: {avg_fields:.1f}/7")
    
    return results

def test_pattern_optimization():
    """Test d'optimisation des patterns"""
    print("\n🎯 Test d'optimisation des patterns...")
    
    # Textes de test typiques
    test_texts = [
        "ROYAUME DU MAROC CARTE NATIONALE D'IDENTITE Nom et Prénom AHMED BENALI CNIE A123456 Né le 15/03/1985 à CASABLANCA",
        "BENALI Ahmed A654321 15-03-1985 RABAT MASCULIN",
        "Ahmed BENALI ID: B789012 Birth: 20/12/1990 MARRAKECH M",
        "محمد حسان رقم البطاقة C456789 الازدياد 10/05/1988 الدار البيضاء"
    ]
    
    extractor = MoroccanCNIEExtractor()
    
    for i, text in enumerate(test_texts, 1):
        print(f"Test {i}: {text[:50]}...")
        
        # Test extraction normale
        data = extractor.extract_moroccan_data(text, 'fr')
        print(f"   Normal: {data}")
        
        # Test extraction fallback
        fallback = extractor.advanced_extraction_fallback(text)
        print(f"   Fallback: {fallback}")
        
        # Combinaison
        combined = {**data, **fallback}
        print(f"   Combiné: {combined}")
        print()

def main():
    print("=" * 60)
    print("TEST COMPLET D'EXTRACTION CNIE MAROCAIN")
    print("=" * 60)
    
    try:
        # Test 1: OCR de base
        ocr_ok, test_text = test_basic_ocr()
        
        if not ocr_ok:
            print("❌ OCR ne fonctionne pas - arrêt des tests")
            return
        
        # Test 2: Image réelle
        real_ok, real_data = test_real_image()
        
        # Test 3: Plusieurs images
        multi_results = test_multiple_images()
        
        # Test 4: Optimisation patterns
        test_pattern_optimization()
        
        # Résumé final
        print("\n" + "=" * 60)
        print("RÉSUMÉ FINAL:")
        print(f"✅ OCR de base: {'OK' if ocr_ok else 'ERREUR'}")
        print(f"✅ Image réelle: {'OK' if real_ok else 'ERREUR'}")
        
        if multi_results:
            successful = len([r for r in multi_results if r['field_count'] > 0])
            print(f"✅ Tests multiples: {successful}/{len(multi_results)} réussis")
        
        print("\n🔧 RECOMMANDATIONS:")
        if not ocr_ok:
            print("- Installer/configurer Tesseract correctement")
        elif not real_ok:
            print("- Améliorer le prétraitement d'images")
            print("- Optimiser les patterns de reconnaissance")
        else:
            print("- Système fonctionnel, optimisation possible")
            print("- Entraîner le modèle avec plus de données")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()
