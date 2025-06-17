# Analyse des fonctions dans Dashboard.tsx

## Vue d'ensemble
Le composant `Dashboard` est le composant principal d'une application Next.js/React qui gère :
- L'authentification et la redirection des utilisateurs
- L'initialisation des données (utilisateurs, agences, robots)
- La gestion des sélections (agence, service, robot)
- L'affichage des graphiques et tableaux de données
- L'ouverture de formulaires pour les demandes

## Fonctions principales

### 1. Effets (useEffect)

#### `useEffect` de redirection (lignes 110-114)
```typescript
useEffect(() => {
  if (!userData) {
    router.replace('/');
  }
}, [userData, router]);
```
**Rôle** : Redirige vers la page d'accueil si l'utilisateur n'est pas connecté.

#### `useEffect` d'initialisation (lignes 121-167)
```typescript
useEffect(() => {
  if (!initialized.current && username) {
    // Initialisation des données
    loadUserData();
  }
  return () => {
    resetCache();
  };
}, [username]);
```
**Rôle** : 
- Charge les données utilisateur, agences et robots depuis Firestore
- Initialise le cache de données
- Nettoie le cache lors du démontage du composant

**Interactions** :
- Utilise `utils/dataStore.ts` pour les opérations de cache
- Appelle `loadAllAgencies()`, `initializeData()`, `loadAllRobots()`

#### `useEffect` de mise à jour des programmes (lignes 172-199)
```typescript
useEffect(() => {
  const loadPrograms = async () => {
    console.log('(Dashboard) l\'agence ou le service change -> Chargement des programmes...');
    if (selectedAgency && isDataInitialized()) {
      const agencyId = selectedAgency.idAgence;
      const allRobots = getRobotsByAgencyAndService(agencyId, selectedService);
      console.log('Robots chargés:', allRobots);
      setPrograms(allRobots);
      updateService(allRobots);

      if (allRobots.length > 0) {
        const firstRobot = allRobots.find((r: Program) => r.robot === "TOUT") || allRobots[0];
        setSelectedRobot(firstRobot);
        setSelectedRobotData(firstRobot);
        setRobotData(null);
        setRobotData1(null);
        setRobotData2(null);
        setHistoriqueData([]);
        setUseChart4All((prev: boolean) => !prev);
      } else {
        setSelectedRobot(null);
        setSelectedRobotData(null);
      }
    }
  };
  loadPrograms();
}, [selectedAgency, selectedService]);
```
**Rôle** :
- Charge et met à jour la liste des robots disponibles quand l'agence ou le service change
- Gère la sélection automatique du premier robot disponible
- Réinitialise les données affichées lorsque la sélection change

**Variables clés** :
- `agencyId` : ID de l'agence sélectionnée
- `allRobots` : Liste des robots filtrés par agence et service
- `firstRobot` : Premier robot disponible ou option "TOUT"

**Fonctions appelées** :
- `getRobotsByAgencyAndService()` : Récupère les robots filtrés depuis dataStore
- `updateService()` : Met à jour la liste des services disponibles
- `setPrograms()` : Stocke la liste des robots dans l'état
- `setSelectedRobot()` : Sélectionne automatiquement le premier robot

**Effets secondaires** :
- Réinitialise les données de graphique (`setRobotData(null)`)
- Vide l'historique (`setHistoriqueData([])`)
- Bascule l'affichage du graphique (`setUseChart4All`)
- Log les changements dans la console

#### `useEffect` de chargement des données (lignes 204-335)
```typescript
useEffect(() => {
  const loadProgramData = async () => {
    if (selectedRobotData) {
      if (selectedRobotData.robot === "TOUT") {
        // Traitement spécial pour l'option "TOUT"
        const allRobotsEvolution: any[] = [];
        let oneRobotEvolution: any[] = [];
        const arrJoursDuMois: string[] = new Array(31).fill("0");
        const arrJoursDuMois_Type1: string[] = [...arrJoursDuMois];
        const arrJoursDuMois_Type2: string[] = [...arrJoursDuMois];
        let rawData: DataEntry[] = [];

        // Variables pour les totaux
        let totalUnitesMoisCourant_Type1 = 0;
        let totalUnitesMoisN1_Type1 = 0;
        let totalUnitesMoisN2_Type1 = 0;
        let totalUnitesMoisN3_Type1 = 0;
        let totalUnitesMoisCourant_Type2 = 0;
        let totalUnitesMoisN1_Type2 = 0;
        let totalUnitesMoisN2_Type2 = 0;
        let totalUnitesMoisN3_Type2 = 0;

        // Calcul des données consolidées pour tous les robots
        for (const robot of programs) {
          if (robot.robot === "TOUT" || robot.robot === null) continue;
          
          // Filtrage et formatage des données
          rawData = cachedReportingData
            .filter(entry => entry['AGENCE'] + "_" + entry['NOM PROGRAMME'] === robot.id_robot)
            .map((entry: any) => ({
              ...entry,
              'NB UNITES DEPUIS DEBUT DU MOIS': String(entry['NB UNITES DEPUIS DEBUT DU MOIS']),
              'NB UNITES MOIS N-1': String(entry['NB UNITES MOIS N-1']),
              'NB UNITES MOIS N-2': String(entry['NB UNITES MOIS N-2']),
              'NB UNITES MOIS N-3': String(entry['NB UNITES MOIS N-3']),
            }));

          // Calcul des totaux par type de robot
          const robotType = programs.find(p => p.robot === robot.robot)?.type_gain;
          for (const entry of rawData) {
            const unitFactor = robot.type_unite !== 'temps' || robot.temps_par_unite === '0' ? 1 : Number(robot.temps_par_unite);
            if (robotType === 'temps') {
              totalUnitesMoisCourant_Type1 += (Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0) * unitFactor;
              totalUnitesMoisN1_Type1 += (Number(entry['NB UNITES MOIS N-1']) || 0);
              totalUnitesMoisN2_Type1 += (Number(entry['NB UNITES MOIS N-2']) || 0);
              totalUnitesMoisN3_Type1 += (Number(entry['NB UNITES MOIS N-3']) || 0);
            } else {
              totalUnitesMoisCourant_Type2 += (Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0);
              totalUnitesMoisN1_Type2 += (Number(entry['NB UNITES MOIS N-1']) || 0);
              totalUnitesMoisN2_Type2 += (Number(entry['NB UNITES MOIS N-2']) || 0);
              totalUnitesMoisN3_Type2 += (Number(entry['NB UNITES MOIS N-3']) || 0);
            }
          }
        }

        // Création des données consolidées
        const mergedDataType1: DataEntry = {
          ...rawData[0],
          'NB UNITES DEPUIS DEBUT DU MOIS': formatNumber(totalUnitesMoisCourant_Type1),
          'NB UNITES MOIS N-1': formatNumber(totalUnitesMoisN1_Type1),
          'NB UNITES MOIS N-2': formatNumber(totalUnitesMoisN2_Type1),
          'NB UNITES MOIS N-3': formatNumber(totalUnitesMoisN3_Type1)
        };

        // Mise à jour des états
        setRobotData1(mergedDataType1);
        setHistoriqueData(allRobotsEvolution);
        setUseChart4All((prev: boolean) => !prev);
      } else {
        // Traitement pour un robot spécifique
        setUseChart4All(false);
        const tpsParUnit = selectedRobotData.temps_par_unite === '0' ? '0' : selectedRobotData.temps_par_unite;
        const data = cachedReportingData
          .filter(entry => entry['AGENCE'] + "_" + entry['NOM PROGRAMME'] === selectedRobotData.agence + "_" + selectedRobotData.robot)
          .map((entry: any) => ({
            ...entry,
            'NB UNITES DEPUIS DEBUT DU MOIS': tpsParUnit !== '0' ? String(Number(entry['NB UNITES DEPUIS DEBUT DU MOIS'])) : String(entry['NB UNITES DEPUIS DEBUT DU MOIS']),
            'NB UNITES MOIS N-1': tpsParUnit !== '0' ? String(Number(entry['NB UNITES MOIS N-1'])) : String(entry['NB UNITES MOIS N-1']),
            'NB UNITES MOIS N-2': tpsParUnit !== '0' ? String(Number(entry['NB UNITES MOIS N-2'])) : String(entry['NB UNITES MOIS N-2']),
            'NB UNITES MOIS N-3': tpsParUnit !== '0' ? String(Number(entry['NB UNITES MOIS N-3'])) : String(entry['NB UNITES MOIS N-3']),
            ...selectedRobot
          }));
        setRobotData(data[0]);
        const oneRobotEvolution = await fetchEvolutionsByProgram(selectedRobotData.robot);
        setHistoriqueData(oneRobotEvolution);
      }
    }
  };
  loadProgramData();
}, [selectedRobotData]);
```
**Rôle** :
- Charge et traite les données de reporting pour le robot sélectionné
- Gère deux cas distincts : robot spécifique ou option "TOUT"
- Effectue des calculs complexes de consolidation des données
- Met à jour les états pour l'affichage des graphiques et tableaux

**Variables clés** :
- `selectedRobotData` : Robot/Programme sélectionné
- `rawData` : Données brutes du reporting
- `mergedDataType1` : Données consolidées pour l'affichage
- Variables de totaux (totalUnitesMoisCourant_Type1, etc.)

**Fonctions appelées** :
- `formatNumber()` : Formate les nombres pour l'affichage
- `fetchEvolutionsByProgram()` : Récupère l'historique des évolutions
- `setRobotData()`/`setRobotData1()` : Stocke les données traitées

**Cas particuliers** :
- Traitement spécial pour l'option "TOUT" (consolidation de tous les robots)
- Gestion des facteurs de conversion (temps_par_unite)
- Formatage différent selon le type de robot (temps ou autre)

### 2. Handlers d'événements

 #### `handleAgencyChange` (lignes 340-372)
```typescript
const handleAgencyChange = (agencyId: string) => {
  const agencySelected = agencies.find(a => a.idAgence === agencyId);
  setSelectedAgency(agencySelected || null);
  sessionStorage.setItem('selectedAgencyId', agencyId);
  
  // Réinitialisation complète des états liés
  setSelectedService('');
  setPrograms([]);
  setSelectedRobot(null);
  setSelectedRobotData(null);
  setRobotData(null);
  setHistoriqueData([]);

  // Chargement des robots pour la nouvelle agence
  if (agencySelected && isDataInitialized()) {
    const allRobots = agencySelected.idAgence === '99'
      ? getRobotsByAgency('99')
      : getRobotsByAgency(agencySelected.idAgence);
    setPrograms(allRobots);
    updateService(allRobots);
  }
};
```
**Rôle** :
- Gère le changement d'agence sélectionnée de manière complète
- Persiste la sélection dans sessionStorage
- Nettoie tous les états dépendants
- Charge les robots correspondants à la nouvelle agence

**Interactions** :
- Utilise `getRobotsByAgency()` depuis dataStore.ts
- Met à jour le state via `setPrograms()` et `updateService()`
- Gère le cas spécial de l'agence "TOUT" (idAgence = '99')

 #### `handleProgramChange` (lignes 377-387)
```typescript
const handleProgramChange = (robotID: string) => {
  const program = programs.find(p => p.id_robot === robotID);
  if (program && selectedAgency) {
    setSelectedRobot(program);
    setSelectedRobotData(program);
    // Déclenche le useEffect de chargement des données
  } else {
    console.log('Programme ou agence non trouvé');
  }
};
```
**Rôle** :
- Gère le changement de robot sélectionné
- Vérifie la cohérence avec l'agence sélectionnée
- Déclenche le chargement des données via le useEffect associé

**Interactions** :
- Déclenche le useEffect qui appelle `loadProgramData()`
- Met à jour les états `selectedRobot` et `selectedRobotData`
- Gère les cas d'erreur via les logs



 #### `updateService` (lignes 401-422)
```typescript
const updateService = (filteredRobots: Program[]) => {
  const services = new Set<string>(['TOUT']);
  
  // Construction dynamique de la liste des services
  filteredRobots.forEach(robot => {
    services.add(robot.service || "TOUT");
  });

  // Mise à jour de l'UI seulement si nécessaire
  if (!isUserSelectingService) {
    setAvailableServices(services);
    if (selectedService && !services.has(selectedService)) {
      setSelectedService("TOUT");
    }
  }
};
```
**Rôle** :
- Construit dynamiquement la liste des services disponibles
- Gère le cas par défaut "TOUT"
- Synchronise la sélection courante avec les services disponibles
- Évite les mises à jour inutiles pendant la sélection utilisateur

**Logique** :
- Utilise un Set pour éviter les doublons
- Gère les robots sans service spécifié
- Respecte le flag isUserSelectingService

## Interactions avec les autres composants

### Composants enfants utilisés :
- `AgencySelector` : Sélecteur d'agences (lignes 461-465)
- `ServiceSelector` : Sélecteur de services (lignes 469-477)
- `ProgramSelector` : Sélecteur de robots (lignes 481-485)
- `Chart`/`Chart4All` : Affichage des graphiques (lignes 530-534/524-528)
- `ProgramTable` : Affichage des données tabulaires (lignes 540-546)
- `MergedRequestForm` : Formulaire de demande (lignes 499-514)

### Utilitaires utilisés :
- `utils/dataStore.ts` : Gestion du cache des données
- `utils/dataFetcher.ts` : Récupération des données de reporting

## Flux de données
1. Initialisation des données utilisateur et agences
2. Sélection d'une agence → chargement des robots correspondants
3. Sélection d'un service → filtrage des robots
4. Sélection d'un robot → chargement des données de reporting
5. Affichage dans les composants Chart/Table