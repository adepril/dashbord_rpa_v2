# Analyse du mécanisme de l'histogramme et des widgets mensuels

Le système utilise une combinaison de composants React (`Chart4All.tsx`, `Chart.tsx`, `Dashboard.tsx`) et un module de gestion des données (`utils/dataStore.ts`) pour calculer, afficher et interagir avec l'histogramme des 4 derniers mois.

## 1. Calcul des jours et des données par mois (N, N-1, N-2, N-3)

Le calcul des données de l'histogramme est centralisé dans le composant `Dashboard.tsx` et le module `utils/dataStore.ts`.

*   **`utils/dataStore.ts` (Chargement et agrégation des données de reporting)**
    *   La fonction [`initializeReportingData()`](utils/dataStore.ts:775-859) est responsable du chargement initial et de la mise en cache des données de reporting depuis Firestore. Ces données incluent des entrées pour chaque jour du mois pour chaque robot.
    *   Le cache `cachedReportingData` (déclaré dans `utils/dataStore.ts`) stocke les données pour le mois courant (`currentMonth`), et les trois mois précédents (`prevMonth1`, `prevMonth2`, `prevMonth3`).
    *   Les fonctions telles que [`getTotalCurrentMonth()`](utils/dataStore.ts:719-724), [`getTotalPrevMonth1()`](utils/dataStore.ts:726-731), etc., agrègent les totaux pour chaque mois à partir de `cachedReportingData`.
    *   Les fonctions [`getRobotTotalCurrentMonth()`](utils/dataStore.ts:691-696), etc., permettent de récupérer les totaux spécifiques à un robot pour chaque mois.

*   **`components/Dashboard.tsx` (Préparation des données pour les graphiques)**
    *   Dans le `useEffect` qui dépend de `selectedRobotData` et `selectedMonth` ([`components/Dashboard.tsx:229`](components/Dashboard.tsx:229)), le `Dashboard` détermine quelles données envoyer au composant `Chart` ou `Chart4All`.
    *   Si `selectedRobotData.robot` est "TOUT" (c'est-à-dire que l'utilisateur souhaite voir l'histogramme global pour toutes les agences/services), le `Dashboard` prépare les données pour `Chart4All.tsx`.
        *   Il itère sur tous les programmes (`programs`) et agrège les données journalières (`arrJoursDuMois_Type1`, `arrJoursDuMois_Type2`) et les totaux mensuels pour les robots de type "temps" et "autre".
        *   La date affichée (`displayMonth`, `displayYear`) est calculée en fonction du `selectedMonth` (`N`, `N-1`, etc.). Le code gère le passage d'année et le cas particulier du 1er du mois.
        *   Ces données agrégées (`mergedDataType1`) sont ensuite passées à `Chart4All.tsx` via la prop `data1`.
    *   Si un robot spécifique est sélectionné (pas "TOUT"), le `Dashboard` prépare les données pour `Chart.tsx`.
        *   Il filtre `cachedReportingData` pour récupérer les entrées spécifiques au `selectedRobotData` pour le mois sélectionné (`currentMonthData`, `prevMonth1Data`, etc.).
        *   Les totaux mensuels pour ce robot (`totalCurrentMonth_Chart`, etc.) sont également extraits.
        *   Les données spécifiques au robot (`processedData`) sont passées à `Chart.tsx` via la prop `data`.

## 2. Affichage de l'histogramme et des données mensuelles

*   **`components/Chart4All.tsx` (Histogramme global)**
    *   Reçoit les props `data1` (données journalières agrégées), `totalCurrentMonth`, `totalPrevMonth1`, `totalPrevMonth2`, `totalPrevMonth3` (totaux mensuels globaux), `selectedMonth` et `setSelectedMonth`.
    *   Construit `chartData1` ([`components/Chart4All.tsx:140`](components/Chart4All.tsx:140)) pour les 31 jours du mois, en utilisant les valeurs de `data1`. Si une date n'a pas de données, la valeur est 0.
    *   Affiche l'histogramme (`BarChart`) en utilisant `chartData1`.
    *   Les widgets des totaux mensuels (`Mois courant`, `Mois N-1`, etc.) affichent les valeurs passées en props (`totalCurrentMonth`, etc.).

*   **`components/Chart.tsx` (Histogramme par robot)**
    *   Similaire à `Chart4All.tsx`, mais reçoit les props `data` (données journalières pour un robot spécifique), `totalCurrentMonth`, `totalPrevMonth1`, `totalPrevMonth2`, `totalPrevMonth3` (totaux mensuels pour le robot sélectionné), `selectedMonth` et `setSelectedMonth`.
    *   Construit `chartData` ([`components/Chart.tsx:87`](components/Chart.tsx:87)) pour les 31 jours du mois, en utilisant les valeurs de `data`.
    *   Affiche l'histogramme (`BarChart`) en utilisant `chartData`.
    *   Les widgets des totaux mensuels affichent les valeurs spécifiques au robot.

## 3. Changement de mois via les widgets

*   Dans les deux composants `Chart4All.tsx` et `Chart.tsx`, les 4 widgets mensuels (`Mois courant`, `Mois N-1`, etc.) sont des éléments cliquables.
*   Chaque widget a un `onClick` qui appelle la fonction `setSelectedMonth` passée en prop ([`components/Chart4All.tsx:234`](components/Chart4All.tsx:234), [`components/Chart.tsx:208`](components/Chart.tsx:208)).
*   `setSelectedMonth` est une fonction `setState` définie dans `Dashboard.tsx` ([`components/Dashboard.tsx:97`](components/Dashboard.tsx:97)). Lorsqu'elle est appelée, elle met à jour l'état `selectedMonth` du `Dashboard` (`'N'`, `'N-1'`, `'N-2'`, ou `'N-3'`).
*   La modification de `selectedMonth` dans `Dashboard.tsx` déclenche le `useEffect` ([`components/Dashboard.tsx:229`](components/Dashboard.tsx:229)) qui recharge les données (`loadProgramData()`) pour le nouveau mois sélectionné, mettant ainsi à jour l'histogramme et les totaux affichés.

## 4. Sélection du widget du mois qui correspond à l'histogramme

*   Les classes CSS des widgets mensuels dans `Chart4All.tsx` et `Chart.tsx` sont conditionnelles, basées sur la valeur de la prop `selectedMonth`.
*   Par exemple, pour le "Mois courant" dans `Chart4All.tsx` ([`components/Chart4All.tsx:234`](components/Chart4All.tsx:234)):
    ```typescript
    <div className={selectedMonth?.toLowerCase()==='n' ? ('bg-[#3333db] text-white shadow-md rounded-lg py-2 cursor-pointer') : ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2 cursor-pointer')} onClick={() => setSelectedMonth('N')}>
    ```
    Si `selectedMonth` est `'N'` (mois courant), le widget aura un fond `bg-[#3333db]` (bleu foncé). Sinon, il aura un fond `bg-[#3498db]` (bleu clair) et un effet `hover`. Ce style visuel indique quel mois est actuellement affiché dans l'histogramme.

## Résumé du flux :

1.  **Initialisation:** `Dashboard.tsx` charge toutes les données de reporting pour les 4 mois (`N`, `N-1`, `N-2`, `N-3`) via `utils/dataStore.ts` et les met en cache.
2.  **Sélection:** L'utilisateur sélectionne une agence, un service et/ou un robot dans le `Dashboard`. Par défaut, le `selectedMonth` est `'N'`.
3.  **Préparation des données:** `Dashboard.tsx` détecte les changements de sélection et de `selectedMonth`. Il agrège les données pertinentes (globales pour "TOUT" ou spécifiques au robot) pour le mois sélectionné, en extrayant les valeurs journalières et les totaux mensuels du cache.
4.  **Rendu de l'histogramme:** Les données préparées sont passées à `Chart4All.tsx` (pour "TOUT") ou `Chart.tsx` (pour un robot spécifique). Ces composants construisent le `chartData` pour les 31 jours et affichent l'histogramme correspondant.
5.  **Interaction avec les widgets:** Lorsque l'utilisateur clique sur un widget mensuel, `setSelectedMonth` est appelé dans `Dashboard.tsx`, mettant à jour l'état `selectedMonth`.
6.  **Mise à jour:** La modification de `selectedMonth` déclenche un nouveau cycle de préparation des données dans `Dashboard.tsx`, qui à son tour met à jour l'histogramme et les totaux dans le `Chart` ou `Chart4All` affiché.
7.  **Indication visuelle:** Les widgets mensuels changent de style en fonction du `selectedMonth` pour indiquer visuellement le mois actuellement affiché.

## Diagramme (Mermaid)

```mermaid
graph TD
    A[Dashboard.tsx] --> B{Initialisation: loadAllAgencies, initializeData, loadAllRobots, initializeReportingData};
    B --> C[cachedReportingData utils/dataStore.ts];
    C --> D[getTotalCurrentMonth, getTotalPrevMonthX utils/dataStore.ts];
    D --> E[Dashboard.tsx: State totalCurrentMonth, totalPrevMonthX];

    subgraph User Interaction
        F[Dashboard.tsx: handleAgencyChange, handleProgramChange, setSelectedMonth];
        F -- "Selected Agency/Robot" --> G{useEffect: loadProgramData};
        F -- "Selected Month (N, N-1, ...)" --> G;
    end

    G --> H{Is selectedRobotData.robot === TOUT?};
    H -- Yes --> I[Dashboard.tsx: Aggregate data for Chart4All];
    H -- No --> J[Dashboard.tsx: Filter data for Chart];

    I --> K[Chart4All.tsx: props data1, totalCurrentMonth, ...];
    J --> L[Chart.tsx: props data, totalCurrentMonth, ...];

    K --> M[Chart4All.tsx: Render BarChart & Monthly Widgets];
    L --> N[Chart.tsx: Render BarChart & Monthly Widgets];

    M -- "Click Widget" --> F;
    N -- "Click Widget" --> F;

    style M fill:#f9f,stroke:#333,stroke-width:2px
    style N fill:#f9f,stroke:#333,stroke-width:2px`
    ```