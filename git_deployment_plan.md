# Plan pour le déploiement Git

Ce document décrit les étapes pour initialiser le projet en tant que dépôt Git local et le lier à un dépôt GitHub distant.

### Étapes du Plan

1.  **Initialisation du dépôt Git local** :
    *   Utiliser la commande `git init` dans le répertoire racine du projet (`c:/DEV/Workspace/dashboard_rpa_bbl_2`) pour créer un nouveau dépôt Git local.

2.  **Ajout des fichiers au dépôt** :
    *   Utiliser `git add .` pour ajouter tous les fichiers du projet à l'index Git.

3.  **Premier commit** :
    *   Effectuer le premier commit avec le message "Initial commit" via `git commit -m "Initial commit"`.

4.  **Ajout de la télécommande (remote) GitHub** :
    *   Lier le dépôt local au dépôt GitHub distant en utilisant `git remote add origin https://github.com/adepril/dashbord_rpa_v2.git`.

5.  **Renommage de la branche principale (si nécessaire)** :
    *   Vérifier le nom de la branche actuelle avec `git branch`. Si elle est `master`, la renommer en `main` en utilisant `git branch -M main`.

6.  **Pousser les modifications vers GitHub** :
    *   Pousser la branche locale (`main`) vers le dépôt distant (`origin`) en utilisant `git push -u origin main`.

### Flux de Déploiement Git

```mermaid
graph TD
    A[Démarrer] --> B{Le projet est-il un dépôt Git ?};
    B -- Non --> C[Initialiser le dépôt Git local];
    C --> D[Ajouter tous les fichiers au dépôt];
    D --> E[Effectuer le premier commit];
    E --> F[Ajouter la télécommande GitHub];
    F --> G{Nom de la branche principale locale est-il 'main' ?};
    G -- Non --> H[Renommer la branche en 'main'];
    G -- Oui --> I[Pousser les modifications vers GitHub];
    H --> I;
    I --> J[Terminé];