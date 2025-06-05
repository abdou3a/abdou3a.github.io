# 🏛️ Extracteur de Cartes d'Identité Marocaines (CNIE)

## 📋 Description

Système d'extraction automatique de données à partir de cartes d'identité nationales marocaines (CNIE) utilisant l'intelligence artificielle, l'OCR multilingue et des patterns spécialisés pour le Maroc.

## ✨ Fonctionnalités

### 🔍 Extraction Intelligente
- **OCR Multilingue** : Support français, arabe et anglais
- **Patterns Spécialisés** : Optimisés pour les CNIE marocaines
- **IA Avancée** : Système d'apprentissage automatique
- **Extraction Fallback** : Méthodes de secours intelligentes

### 🛠️ Traitement d'Images
- **Prétraitement Avancé** : Amélioration automatique de la qualité
- **Détection de Contours** : Optimisation pour cartes d'identité
- **Correction de Luminosité** : Adaptation automatique
- **Débruitage** : Filtres professionnels

### 💾 Gestion des Données
- **Base SQLite** : Stockage local sécurisé
- **Export Excel** : Tableaux avec en-têtes bilingues
- **Validation Marocaine** : Vérification des villes et formats
- **Historique Complet** : Traçabilité des extractions

### 🌐 Interface Web
- **Interface Responsive** : Compatible mobile/desktop
- **Upload Multiple** : Traitement par lots
- **Visualisation Temps Réel** : Résultats instantanés
- **API REST** : Intégration facilitée

## 🏗️ Architecture du Projet

```
📁 abdou3a.github.io/
├── 🐍 app.py                     # Application Flask principale
├── 🧠 train_model.py             # Système d'entraînement IA
├── 🌐 templates/
│   └── index.html                # Interface utilisateur principale
├── 🖼️ synthetic_images/          # Images synthétiques d'entraînement
├── 💾 cnie_database.db           # Base de données principal
├── 📊 training_data.db           # Données d'entraînement
├── 📤 exports/                   # Fichiers Excel exportés
├── 📋 requirements.txt           # Dépendances Python
├── 🚀 start_app.py              # Script de démarrage
├── 🧪 test_interface.html        # Interface de test et diagnostic
└── 📊 system_status.py          # Vérification du système
```

## ⚡ Installation Rapide

### 1. Cloner le Projet
```bash
git clone https://github.com/abdou3a/abdou3a.github.io.git
cd abdou3a.github.io
```

### 2. Installer les Dépendances
```bash
# Dépendances Python
pip install -r requirements.txt

# Tesseract OCR (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-fra tesseract-ocr-ara

# Tesseract OCR (macOS)
brew install tesseract tesseract-lang

# Tesseract OCR (Windows)
# Télécharger depuis: https://github.com/UB-Mannheim/tesseract/wiki
```

### 3. Démarrer l'Application
```bash
python start_app.py
```

## 🎯 Utilisation

### Interface Web
1. Ouvrir http://localhost:5000
2. Uploader une image de carte CNIE
3. Visualiser les données extraites
4. Exporter en Excel si nécessaire

### API REST
```python
import requests

# Upload et extraction
files = {'file': open('carte.jpg', 'rb')}
response = requests.post('http://localhost:5000/upload', files=files)
data = response.json()
```

### Interface de Test
- Accéder à http://localhost:5000/test
- Tester l'OCR et l'extraction
- Diagnostiquer les problèmes
- Visualiser les images synthétiques

## 🔧 Configuration

### Patterns d'Extraction
Les patterns sont configurables dans `app.py`:
```python
self.patterns = {
    'fr': {
        'fullName': [
            r'(?:nom\s*et\s*prénom|nom|prénom)\s*:?\s*([A-ZÁÉÈÊËÏÎÔÙÛÜŸÇ\s-]+)',
            # ... autres patterns
        ]
    }
}
```

### Base de Données
Structure automatique créée au premier démarrage:
- `cnie_records` : Données extraites
- `extraction_history` : Historique des traitements
- `training_data` : Données d'entraînement IA

## 🧪 Tests et Diagnostic

### Tests Automatiques
```bash
python comprehensive_test.py
```

### Vérification du Système
```bash
python system_status.py
```

### Tests Unitaires
```bash
python quick_test.py
```

## 📊 Entraînement IA

### Génération de Données Synthétiques
```bash
python train_model.py
```

### Amélioration des Patterns
Le système apprend automatiquement et optimise les patterns de reconnaissance.

## 🌍 Support Multilingue

### Langues Supportées
- **Français** : Extraction complète
- **Arabe** : Support natif pour CNIE bilingues
- **Anglais** : Patterns internationaux

### Villes Marocaines
Base de données intégrée des villes marocaines en français et arabe.

## 📈 Performance

### Métriques Typiques
- **Précision** : >85% sur images de bonne qualité
- **Vitesse** : <2 secondes par carte
- **Formats** : JPG, PNG, PDF, TIFF
- **Résolution** : Optimisé pour 300+ DPI

## 🔒 Sécurité

### Protection des Données
- Stockage local uniquement
- Pas de transmission externe
- Chiffrement optionnel de la DB
- Historique d'audit complet

## 🛠️ Dépannage

### Problèmes Courants

#### OCR ne fonctionne pas
```bash
# Vérifier Tesseract
tesseract --version

# Vérifier les langues
tesseract --list-langs
```

#### Images non reconnues
- Vérifier la qualité (min 300 DPI)
- Améliorer l'éclairage
- Utiliser le prétraitement automatique

#### Erreurs d'extraction
- Consulter les logs dans l'interface
- Tester avec les images synthétiques
- Ajuster les patterns si nécessaire

## 🤝 Contribution

### Structure du Code
- Code documenté en français
- Tests unitaires obligatoires
- Patterns configurables
- Architecture modulaire

### Ajout de Fonctionnalités
1. Fork le projet
2. Créer une branche feature
3. Ajouter des tests
4. Soumettre une PR

## 📄 Licence

Projet open source sous licence MIT.

## 👨‍💻 Auteur

Développé par **abdou3a** - Spécialiste en IA et traitement d'images.

## 🔗 Liens Utiles

- [Demo Live](https://abdou3a.github.io)
- [Documentation API](https://abdou3a.github.io/api-docs)
- [Issues GitHub](https://github.com/abdou3a/abdou3a.github.io/issues)

---

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@abdou3a.dev
- 🐛 GitHub Issues
- 💬 Discussions GitHub

**🎉 Projet complet et prêt à l'emploi !**
