# Plan d'implémentation pour la récupération des totaux par robot

## Objectif
Ajouter la fonctionnalité de récupération des totaux mensuels par robot spécifique.

## Modifications nécessaires dans dataStore.ts

### Nouvelles fonctions à implémenter
```typescript
export function getRobotTotalCurrentMonth(robotId: string): number {
  const entry = cachedReportingData.currentMonth.find(e => 
    e['AGENCE'] + '_' + e['NOM PROGRAMME'] === robotId
  );
  return entry ? Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) : 0;
}

export function getRobotTotalPrevMonth1(robotId: string): number {
  const entry = cachedReportingData.prevMonth1.find(e => 
    e['AGENCE'] + '_' + e['NOM PROGRAMME'] === robotId
  );
  return entry ? Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) : 0;
}

// Idem pour prevMonth2 et prevMonth3
```

## Modifications dans Dashboard.tsx

### Mise à jour des états
Remplacer les appels actuels aux totaux globaux par :
```typescript
setTotalCurrentMonth(getRobotTotalCurrentMonth(selectedRobotData.id_robot));
setTotalPrevMonth1(getRobotTotalPrevMonth1(selectedRobotData.id_robot));
// Idem pour mois N-2 et N-3
```

## Validation
1. Tester avec un robot spécifique
2. Vérifier le cas "TOUT"
3. Confirmer l'affichage correct dans les composants Chart