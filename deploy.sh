#!/bin/bash

echo "🚀 Déploiement automatique de l'AI ID Card Extractor"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Nettoyage et préparation
print_status "Nettoyage des fichiers temporaires..."
rm -f *.tmp *.temp *.log
rm -rf .cache/

# 2. Vérification des fichiers requis
print_status "Vérification des fichiers..."
required_files=("index.html" "ai-id-extractor.js")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Fichier requis manquant: $file"
        exit 1
    fi
done
print_success "Tous les fichiers requis sont présents"

# 3. Configuration Git
print_status "Configuration Git..."
git config user.name "abdou3a" 2>/dev/null || true
git config user.email "abdou3a@users.noreply.github.com" 2>/dev/null || true

# 4. Initialisation du repository si nécessaire
if [[ ! -d ".git" ]]; then
    print_status "Initialisation du repository Git..."
    git init
    git branch -M main
fi

# 5. Configuration du remote
print_status "Configuration du remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/abdou3a/abdou3a.github.io.git

# 6. Staging des fichiers
print_status "Ajout des fichiers..."
git add .

# 7. Vérification des changements
if git diff --staged --quiet; then
    print_warning "Aucun changement détecté"
    exit 0
fi

# 8. Commit
print_status "Création du commit..."
COMMIT_MSG="🤖 Deploy AI ID Card Database Extractor $(date +'%Y-%m-%d %H:%M')

🎯 Features:
- OCR multilingue avec Tesseract.js (FR/AR/EN)
- Extraction intelligente des données ID
- Base de données locale avec export Excel
- Interface moderne responsive
- Support RTL pour l'arabe
- Validation temps réel et indicateurs de confiance

🛠️ Tech Stack:
- Tesseract.js 4.1.1 pour OCR
- SheetJS 0.18.5 pour Excel export
- Font Awesome 6.4.0 pour icônes
- CSS Grid/Flexbox pour layout
- LocalStorage pour persistence

🚀 Production ready with GitHub Pages"

git commit -m "$COMMIT_MSG"

# 9. Push avec gestion des erreurs
print_status "Déploiement vers GitHub Pages..."

# Tentative de push normal
if git push origin main 2>/dev/null; then
    print_success "Déploiement réussi!"
else
    print_warning "Push normal échoué, tentative de force push..."
    
    # Force push si nécessaire
    if git push --force origin main; then
        print_success "Force push réussi!"
    else
        print_error "Échec du déploiement"
        print_status "Tentative avec set-upstream..."
        
        if git push --set-upstream origin main; then
            print_success "Push avec upstream réussi!"
        else
            print_error "Toutes les tentatives ont échoué"
            exit 1
        fi
    fi
fi

# 10. Vérification finale
print_status "Vérification du déploiement..."
sleep 2

print_success "✅ Déploiement terminé avec succès!"
print_status "🌐 Votre application sera disponible à: https://abdou3a.github.io"
print_status "⏱️  Le déploiement GitHub Pages peut prendre 5-10 minutes"
print_status "📱 L'application est maintenant prête pour l'utilisation!"

echo ""
echo "🎉 AI ID Card Database Extractor déployé avec succès!"
echo "🔗 URL: https://abdou3a.github.io"
