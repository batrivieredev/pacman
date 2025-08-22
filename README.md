# 🎮 Pacman Web

Un jeu Pacman moderne développé avec Python Flask et JavaScript, incluant une interface d'administration et un système d'authentification.

![Pacman Game](screenshot.png)

## 🌟 Fonctionnalités

- **Jeu Pacman**
  - Animation fluide et graphismes néon
  - Système de score
  - 3 vies
  - Fantômes avec IA basique
  - Power-ups permettant de manger les fantômes
  - Design responsive

- **Système d'authentification**
  - Inscription
  - Connexion
  - Déconnexion
  - Protection des routes

- **Interface d'administration**
  - Gestion des utilisateurs
  - Création de comptes
  - Modification des profils
  - Suppression d'utilisateurs
  - Interface néon moderne

## 🚀 Installation

1. Cloner le repository
```bash
git clone https://github.com/batrivieredev/pacman.git
cd pacman
```

2. Créer un environnement virtuel et l'activer
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

3. Installer les dépendances
```bash
pip install -r requirements.txt
```

4. Créer un compte administrateur
```bash
python create_admin.py
```

5. Lancer l'application
```bash
python run.py
```

L'application sera accessible à l'adresse: http://localhost:5000

## 🛠️ Technologies utilisées

- **Backend**
  - Python 3.x
  - Flask
  - SQLAlchemy
  - Flask-Login
  - SQLite

- **Frontend**
  - HTML5
  - CSS3 (avec effets néon)
  - JavaScript
  - Bootstrap 5

## 🎮 Comment jouer

1. Créez un compte ou connectez-vous
2. Cliquez sur "Jouer" dans la barre de navigation
3. Utilisez les flèches du clavier pour déplacer Pacman
4. Mangez tous les points pour gagner
5. Les grosses boules vous permettent de manger les fantômes
6. Vous avez 3 vies

## 👥 Rôles utilisateurs

- **Utilisateur standard**
  - Jouer au jeu
  - Voir son score
  - Modifier son profil

- **Administrateur**
  - Toutes les fonctionnalités utilisateur
  - Accès au panneau d'administration
  - Gestion des utilisateurs

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue ou à me contacter directement.
