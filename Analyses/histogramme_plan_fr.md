# Analyse du processus de génération d'histogramme

## Modifications dans initializeReportingData()

La fonction `initializeReportingData()` a été modifiée pour :
- Supprimer la fusion des données entre mois différents
- Ne plus utiliser l'objet `mergedData`
- Traiter séparément les snapshots pour chaque période :
  - Mois courant (`currentMonthSnapshot`)
  - Mois N-1 (`prevMonth1Snapshot`) 
  - Mois N-2 (`prevMonth2Snapshot`)
  - Mois N-3 (`prevMonth3Snapshot`)

## Processus de génération de l'histogramme

1. **Récupération des données** :
   - Chaque snapshot est chargé indépendamment depuis Firestore
   - Aucune fusion n'est effectuée entre les périodes

2. **Stockage** :
   - Les données sont stockées dans `cachedReportingData`
   - Chaque période reste distincte

3. **Affichage** :
   - Le composant `Chart4All.tsx` sélectionne le snapshot approprié
   - Aucun calcul inter-périodes n'est effectué

## Diagramme de flux

```mermaid
graph TD
    A[initializeReportingData] --> B[Création des snapshots]
    B --> B1[currentMonthSnapshot]
    B --> B2[prevMonth1Snapshot] 
    B --> B3[prevMonth2Snapshot]
    B --> B4[prevMonth3Snapshot]
    
    B1 --> C1[Traitement données mois courant]
    B2 --> C2[Traitement données N-1]
    B3 --> C3[Traitement données N-2] 
    B4 --> C4[Traitement données N-3]
    
    C1 --> D[Stockage dans cachedReportingData]
    C2 --> D
    C3 --> D
    C4 --> D
    
    D --> E[Composant Chart4All.tsx]
    E --> F{Affichage histogramme}
    F -->|Mois courant| G[Utilise currentMonthSnapshot]
    F -->|Mois N-1| H[Utilise prevMonth1Snapshot]
    F -->|Mois N-2| I[Utilise prevMonth2Snapshot]
    F -->|Mois N-3| J[Utilise prevMonth3Snapshot]
```

## Spécifications techniques

- **Données séparées** : Chaque période a son propre snapshot
- **Pas de fusion** : Les données ne sont pas mélangées entre périodes
- **Sélection simple** : Le composant choisit directement le snapshot à afficher