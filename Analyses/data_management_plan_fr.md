# Plan de Gestion des Données

Ce document décrit le processus complet de gestion des données dans le projet, depuis la récupération dans Firebase jusqu'à l'affichage, incluant le filtrage, le traitement, les calculs pour les histogrammes et les relations entre les différentes entités de données.

## 1. Introduction au Flux de Données
Cette section fournit une vue d'ensemble de la gestion des données dans le projet. Les données commencent par être récupérées depuis Firebase Firestore, subissent un filtrage et un traitement, et finissent par être affichées dans l'interface utilisateur. Les fichiers clés impliqués sont :
- `lib/firebase.ts` : Initialise Firebase et fournit l'accès à Firestore.
- `utils/dataFetcher.ts` : Gère la récupération des données, le filtrage et le traitement initial.
- `components/Chart.tsx` : Traite davantage les données pour les visualisations comme les histogrammes.

## 2. Récupération des Données depuis Firebase
La récupération des données commence dans `lib/firebase.ts`, où l'application Firebase est initialisée en utilisant la configuration :
- Le fichier importe les modules Firebase nécessaires et configure Firestore (`db`) et l'authentification (`auth`).
- Dans `utils/dataFetcher.ts`, des fonctions comme `fetchAgenciesByIds`, `fetchAllEvolutions` et `fetchEvolutionsByProgram` utilisent des requêtes Firestore pour récupérer des données depuis des collections comme 'agences', 'evolutions' et 'utilisateurs'.
- Les requêtes sont construites en utilisant des clauses `query` et `where` pour filtrer les données selon des critères (par exemple, `where('idAgence', '==', agencyId)`).

## 3. Filtrage et Traitement des Données
Une fois récupérées, les données sont filtrées et traitées dans `utils/dataFetcher.ts` :
- **Filtrage** : Par exemple, dans `fetchAllEvolutions`, les documents sont groupés par le champ 'Robot', et seul le document avec la valeur 'statut' la plus élevée est conservé. Cela garantit que seules les données les plus pertinentes sont utilisées.
- **Traitement** : Les données sont mappées vers des interfaces spécifiques (par exemple, transformation des données brutes Firestore en tableaux d'objets). La gestion des erreurs capture les problèmes et renvoie des tableaux vides pour éviter les échecs. De plus, des fonctions comme `formatNumber` formatent les données numériques pour assurer la cohérence.
- Cette étape prépare les données pour l'affichage en supprimant les entrées invalides et en appliquant une logique conditionnelle, garantissant que seules des données propres et traitées sont transmises aux composants de l'interface utilisateur.

## 4. Calculs pour l'Affichage des Histogrammes
Dans `components/Chart.tsx`, les données récupérées sont davantage traitées pour le rendu des histogrammes :
- Le composant génère des données de graphique pour le mois en cours (jusqu'à 31 jours) en créant un tableau d'objets.
- Les calculs incluent la multiplication des comptes d'exécution par le temps par unité (comme référencé dans les commentaires de `utils/dataFetcher.ts`) et le formatage des valeurs en utilisant `formatDuration` depuis `lib/utils`.
- Pour différents types de robots (par exemple, 'temps'), une logique spécifique s'applique, comme la conversion des valeurs en durées ou en comptes, et la gestion des cas limites où les valeurs sont zéro ou non définies.

## 5. Relations Entre les Entités de Données
Le projet implique plusieurs collections Firestore avec des interrelations :
- La collection 'Agences' est liée à 'evolutions' via les ID d'agence, permettant de filtrer les données par agence.
- Les données 'Evolutions' peuvent référencer des informations utilisateur depuis 'utilisateurs' via des champs comme userAgenceIds.
- Ces relations sont interrogées et combinées dans `utils/dataFetcher.ts` pour construire des ensembles de données complets, garantissant que les données liées (par exemple, les détails d'agence avec les statistiques d'évolution) sont récupérées et traitées ensemble.

## 6. Affichage Final
Les données traitées sont rendues dans `components/Chart.tsx` :
- Le composant utilise Recharts pour afficher des histogrammes, des infobulles et des indicateurs.
- Les données sont rendues conditionnellement en fonction de leur disponibilité, avec un formatage des étiquettes et des axes pour garantir un affichage convivial.
- Cette étape finale intègre toutes les données filtrées et calculées dans l'interface utilisateur, fournissant des visualisations comme des diagrammes en barres pour les histogrammes.

## Diagramme Mermaid
Pour visualiser le flux de données :

```mermaid
graph TD
    A[Collections Firestore Firebase] --> B[utils/dataFetcher.ts]
    B --> C[Logique de Filtrage & Traitement]
    C --> D[components/Chart.tsx]
    D --> E[Composants UI pour l'Affichage]
    A -->|Requête avec Filtres| B
    B -->|Tableaux de Données Traitées| C
    C -->|Données de Graphique Calculées| D
    D -->|Graphiques & Indicateurs Rendu| E