### Analyse du Mécanisme de l'Histogramme (Juillet 2025)

#### 1. Calcul des Jours et des Données Mensuelles

Le calcul des données affichées dans l'histogramme dépend de l'état `selectedMonth`, qui peut avoir les valeurs 'N', 'N-1', 'N-2', ou 'N-3'.

Le cœur de la logique se trouve dans le `useEffect` du composant `Dashboard.tsx` qui s'exécute lorsque `selectedRobotData` ou `selectedMonth` changent.

**Comment les jours sont-ils calculés ?**

Les données brutes de reporting contiennent une entrée pour chaque jour du mois sous un format de clé : `DD/MM/YYYY`.

Le composant détermine d'abord le mois et l'année à afficher en se basant sur la date actuelle et la valeur de `selectedMonth`.

```typescript
// Calculer le mois et l'année en fonction du selectedMonth
const currentDate = new Date();
let displayMonth = currentDate.getMonth() + 1;
let displayYear = currentDate.getFullYear();

if (selectedMonth !== 'N') {
  const monthOffset = parseInt(selectedMonth.split('-')[1]); // Extrait 1, 2, ou 3 de 'N-1', etc.
  displayMonth -= monthOffset;
  if (displayMonth < 1) { // Gère le changement d'année
    displayMonth += 12;
    displayYear -= 1;
  }
}

const currentMonth = displayMonth.toString().padStart(2, '0');
const currentYear = displayYear;
```

Ensuite, pour agréger les données, le code parcourt les jours de 1 à 31 et recherche la clé correspondante (`DD/MM/YYYY`) dans les données de reporting pour ce mois.

```typescript
for (let i = 1; i <= 31; i++) {
  const dateKey = i.toString().padStart(2, '0') + '/' + currentMonth + '/' + currentYear;
  if (entry[dateKey]) {
    const value = entry[dateKey];
    // ... additionne la valeur au total du jour
  }
}
```

En résumé, le système ne "calcule" pas les jours, il les **lit** à partir des données sources où chaque jour est une clé.

#### 2. Sélection des Données (Mois N, N-1, etc.)

Le composant utilise des données pré-chargées et mises en cache via le module `dataStore`. Ce module expose des tableaux de données distincts pour chaque période : `cachedReportingData.currentMonth`, `cachedReportingData.prevMonth1`, etc.

**Cas 1 : Un robot spécifique est sélectionné**

Le code utilise un `switch` pour sélectionner le bon jeu de données en fonction de la valeur de `selectedMonth`.

```typescript
const robotEntry = (() => {
  switch(selectedMonth) {
  case 'N':
    return currentMonthData[0]; // Données du mois courant
  case 'N-1':
    return prevMonth1Data[0];   // Données de N-1
  case 'N-2':
    return prevMonth2Data[0];   // Données de N-2
  case 'N-3':
    return prevMonth3Data[0];   // Données de N-3
  default:
    return currentMonthData[0];
  }
})();
```

**Cas 2 : "TOUT" est sélectionné**

Lorsque l'utilisateur veut voir les données de tous les robots, il utilise la fonction `getReportingData(selectedMonth)` de `dataStore` qui retourne le bon jeu de données. Ensuite, le code boucle sur tous les programmes pour agréger les données journalières.

#### 3. Changement de Mois (Clic sur un widget)

Cette fonctionnalité est gérée par une communication entre le composant parent (`Dashboard`) et le composant enfant (`Chart` ou `Chart4All`).

1.  **État dans le Parent** : `Dashboard.tsx` maintient l'état `const [selectedMonth, setSelectedMonth] = useState<string>('N');`.
2.  **Passage en Props** : `setSelectedMonth` et `selectedMonth` sont passées en props au composant de graphique.
3.  **Action dans l'Enfant** : Dans le graphique, un `onClick` sur un widget appelle `setSelectedMonth` avec la nouvelle valeur (ex: 'N-1').
4.  **Mise à Jour et Re-rendu** : L'état est mis à jour dans `Dashboard`, ce qui déclenche le `useEffect` de chargement des données, qui à son tour met à jour les données du graphique et provoque un re-rendu.

#### 4. Sélection du Widget Actif

La sélection visuelle du widget est gérée dans le composant enfant (`Chart` ou `Chart4All`) en utilisant la prop `selectedMonth`. Une classe CSS conditionnelle est appliquée au widget dont l'identifiant correspond à la valeur de `selectedMonth`, lui donnant un style "actif".
