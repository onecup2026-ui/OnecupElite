# ONECUP Elite 2026 - Plateforme Officielle

Une plateforme premium inspirée de l'excellence sportive mondiale, conçue pour la gestion des tournois ONECUP en RDC.

## 🚀 Déploiement & Configuration

### 1. Domaines Autorisés (Firebase Auth)
Si vous voyez l'erreur `auth/unauthorized-domain`, vous devez autoriser votre URL de développement :
1. Allez sur la [Console Firebase](https://console.firebase.google.com/).
2. Accédez à **Authentication** > **Settings** > **Authorized domains**.
3. Ajoutez le domaine de votre environnement actuel (ex: `*.cloudworkstations.dev`).

### 2. Publication sur GitHub
Pour lier ce projet à votre compte GitHub (`christianrwemera7-max`) :

1. **Initialiser Git** :
   ```bash
   rm -rf .git
   git init
   ```

2. **Ajouter et Commiter** :
   ```bash
   git add .
   git commit -m "Initial commit - ONECUP Elite Platform"
   ```

3. **Lier au dépôt** :
   ```bash
   git remote add origin https://github.com/christianrwemera7-max/onecup.git
   git branch -M main
   git push -u origin main
   ```

## ⚡️ Déploiement Vercel
1. Importez votre dépôt GitHub sur Vercel.
2. Configurez les variables d'environnement si nécessaire.
3. Déployez.

---
© 2026 ONE CUP Platform. Élite • Prestige • Performance.
