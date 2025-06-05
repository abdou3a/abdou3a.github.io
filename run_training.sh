#!/bin/bash

echo "🇲🇦 ENTRAÎNEMENT DU MODÈLE IA CNIE MAROC"
echo "=" * 50

# Vérifier Python et dépendances
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 non trouvé"
    exit 1
fi

# Installer les dépendances si nécessaire
echo "📦 Installation des dépendances..."
pip3 install -r requirements.txt

# Créer les dossiers nécessaires
mkdir -p training_images synthetic_images exports

# Lancer l'entraînement
echo "🚀 Lancement de l'entraînement..."
python3 train_model.py

# Copier les patterns optimisés
if [ -f "optimized_patterns.json" ]; then
    echo "✅ Patterns optimisés générés"
    echo "📁 Fichier: optimized_patterns.json"
else
    echo "❌ Erreur: Patterns non générés"
fi

echo "🎉 Entraînement terminé!"
