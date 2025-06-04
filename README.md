# 🐍 Snake 3D Online - Jeu Multijoueur Complet

Un jeu Snake 3D moderne et complet avec système d'authentification, base de données persistante, effets sonores et visuels avancés.

## ✨ Fonctionnalités Complètes

### 🎮 Système de Jeu
- **Snake 3D** avec graphismes Three.js haute qualité
- **4 niveaux de difficulté** : Facile, Normal, Difficile, Extrême
- **Effets sonores** : Sons d'action et feedback audio
- **Effets de particules** : Animations visuelles immersives
- **Mini-map en temps réel** avec boussole et indicateurs

### 🔐 Authentification et Données
- **Système d'inscription/connexion** sécurisé
- **Validation complète** des données utilisateur
- **Sessions persistantes** avec reconnexion automatique
- **Base de données simulée** avec sauvegarde dans le repository

### 🏆 Progression et Achievements
- **Système de niveaux** basé sur le score total
- **6 achievements** déblocables avec progression
- **Classement global** des 10 meilleurs joueurs
- **Statistiques détaillées** de performance

### 🎨 Personnalisation
- **4 thèmes visuels** : Classique, Néon, Rétro, Océan
- **Paramètres audio** : Volume réglable
- **Options visuelles** : Particules activables/désactivables
- **Sauvegarde automatique** des préférences

### 📱 Interface et Contrôles
- **Interface responsive** pour tous les appareils
- **Contrôles tactiles** optimisés pour mobile
- **Feedback visuel** des actions
- **Modales informatives** pour les statistiques

## 🎯 Guide de Jeu

### Inscription et Connexion
1. **Créer un compte** avec nom d'utilisateur unique, email et mot de passe
2. **Se connecter** avec vos identifiants
3. **Session automatique** pour les prochaines visites

### Modes de Difficulté
- **Facile** : Vitesse lente, progression douce
- **Normal** : Équilibré pour la plupart des joueurs
- **Difficile** : Rapide avec progression accélérée
- **Extrême** : Défi ultime pour les experts

### Contrôles
- `WASD` ou `Flèches` : Diriger le serpent
- `Espace` : Pause/Reprendre
- `R` : Redémarrer (en pause)
- `Échap` : Retour au menu principal

### Scoring
- **Points de base** : 10 points par nourriture
- **Bonus de difficulté** : Multiplicateur selon le niveau choisi
- **Bonus de niveau** : Points supplémentaires tous les 100 points

## 🏆 Système d'Achievements

| Achievement | Description | Récompense |
|-------------|-------------|------------|
| 🎮 **Premier Pas** | Jouer votre première partie | Déblocage du profil |
| 💯 **Centurion** | Atteindre 100 points | Badge Bronze |
| 🐍 **Serpent Géant** | Longueur de 10 segments | Badge Argent |
| ⚡ **Maître de Vitesse** | Atteindre le niveau 5 | Badge Or |
| 🛡️ **Survivant** | Jouer pendant 2 minutes | Badge Platine |
| ⭐ **Perfectionniste** | Score de 500 points | Badge Diamant |

## 🎨 Thèmes Disponibles

### Classique 🟢
- Serpent : Vert néon
- Nourriture : Or
- Fond : Bleu marine

### Néon 🔴
- Serpent : Magenta électrique
- Nourriture : Cyan
- Fond : Noir profond

### Rétro 🟡
- Serpent : Vert arcade
- Nourriture : Rouge pixel
- Fond : Bleu vintage

### Océan 🔵
- Serpent : Bleu océan
- Nourriture : Orange corail
- Fond : Bleu profond

## 🛠️ Technologies et Architecture

### Frontend
- **HTML5** : Structure et sémantique
- **CSS3** : Styles modernes et animations
- **JavaScript ES6+** : Logique avancée et POO
- **Three.js r128** : Rendu 3D et WebGL

### Systèmes
- **Web Audio API** : Effets sonores dynamiques
- **LocalStorage** : Simulation de base de données
- **Canvas 2D** : Mini-map et effets 2D
- **Responsive Design** : Support multi-appareils

### Architecture du Code
```
SnakeGameOnline (Classe principale)
├── Authentication System
├── Game Engine (Three.js)
├── Audio System (Web Audio API)
├── Settings Management
├── Database Simulation
├── UI/UX Management
└── Achievement System
```

## 📊 Statistiques Trackées

- **Score actuel et record personnel**
- **Nombre total de parties jouées**
- **Temps de jeu cumulé**
- **Niveau de progression atteint**
- **Achievements débloqués**
- **Classement global**

## 🔧 Paramètres Configurables

### Audio
- Volume des effets sonores (0-100%)
- Sons d'action activables/désactivables

### Visuel
- Choix du thème de couleurs
- Effets de particules on/off
- Qualité des ombres

### Gameplay
- Niveau de difficulté
- Sauvegarde automatique
- Contrôles personnalisés

## 🚀 Installation et Déploiement

### Installation Locale
```bash
git clone [repository-url]
cd abdou3a.github.io
# Ouvrir index.html dans un navigateur moderne
```

### Déploiement GitHub Pages
1. Push du code sur GitHub
2. Activation de GitHub Pages
3. Accès via l'URL : `https://abdou3a.github.io`

### Prérequis Système
- **Navigateur moderne** avec support WebGL 2.0
- **JavaScript activé**
- **Connexion internet** (pour les polices et CDN)
- **Espace de stockage** pour les données utilisateur

## 📱 Compatibilité

| Plateforme | Support | Notes |
|------------|---------|-------|
| Desktop | ✅ Complet | Expérience optimale |
| Tablette | ✅ Complet | Contrôles tactiles |
| Mobile | ✅ Adapté | Interface simplifiée |
| WebGL | ✅ Requis | Pour les effets 3D |

## 🎯 Roadmap Future

### Version 2.1 (Prévue)
- Mode multijoueur en temps réel
- Chat entre joueurs
- Tournois organisés
- Replays de parties

### Version 2.2 (En développement)
- IA adaptive pour mode solo
- Nouveaux power-ups
- Modes de jeu alternatifs
- Système de clans

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Fork le repository
2. Créer une branche feature
3. Committer vos changements
4. Soumettre une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir `LICENSE` pour plus de détails.

---

**🎮 Développé avec passion pour offrir la meilleure expérience Snake 3D en ligne !**

### 📞 Support

- **Issues GitHub** : Pour les bugs et suggestions
- **Documentation** : Guide complet dans le README
- **Communauté** : Partagez vos scores et astuces !
