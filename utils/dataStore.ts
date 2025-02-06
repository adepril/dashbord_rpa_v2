import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cookies } from 'next/headers';

// Interfaces
export interface Agency {
  idAgence: string;
  nomAgence: string;
  libelleAgence?: string;
}

// Interface pour les données du robot
export interface Program {
  robot: string;
  id_robot: string;
  agence: string;
  description?: string;
  date_maj?: string;
  type_unite: string;
  temps_par_unite: string;
  type_gain: string;
  validateur?: string;
  valide_oui_non?: string;
  service?: string;
  probleme?: string;
  description_long?: string;
  resultat?: string;
  currentMonth?: string;
  previousMonth?: string;
  name?: string;
  type?: string;
  status?: string;
}

// Variables globales pour le cache
let cachedAgencies: Agency[] = [];
export let cachedAllRobots: Program[] = [];
export let cachedRobots: Program[] = [];
// Variable pour stocker la fonction de mise à jour des robots
let updateRobotsCallback: ((robots: Program[]) => void) | null = null;

// Fonction pour mettre à jour les robots
export function updateRobots(robots: Program[]): void {
  if (updateRobotsCallback) {
    updateRobotsCallback(robots);
  }
}

// Fonction pour définir le callback de mise à jour des robots
export function setUpdateRobotsCallback(callback: (robots: Program[]) => void): void {
  updateRobotsCallback = callback;
}
let isInitialized = false;
let isFirstLogin = true;

// Fonction d'initialisation des données
export async function initializeData(userId: string): Promise<void> {
  if (isInitialized) return;

  try {
    // 1. Récupérer les données de l'utilisateur
    const userData = await fetchUserData(userId);
    if (!userData) {
      throw new Error('Utilisateur non trouvé');
    }
    console.log('(dataStore - initializeData) Données utilisateur:', userData);

    // 2. Charger les agences
    if (userId === '0') {
      // Cas spécial pour l'admin : charger toutes les agences
      //await loadAllAgencies();
      //console.log('(dataStore - initializeData) Toutes les Agences chargées');
    } else {
      // Cas normal : charger les agences de l'utilisateur
      await loadUserAgencies(userData.userAgenceIds);
      console.log('## (dataStore - initializeData) Chargement des agences utilisateur', userData.userAgenceIds);
      console.log('## (dataStore - initializeData) Agences chargées', cachedAgencies);
    }

    // 3. Charger tous les robots pour ces agences
    await loadAllRobotsForAgencies();
    console.log('(dataStore - loadAllRobotsForAgencies) Chargement des robots', cachedRobots);

    isInitialized = true;
  } catch (error) {
    console.log('Erreur lors de l\'initialisation des données:', error);
    throw error;
  }
}

async function fetchUserData(userId: string) {
  try {
    const usersRef = collection(db, 'utilisateurs');
    const q = query(usersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userData = querySnapshot.docs[0].data();
    return {
      userId: userData.userId,
      userName: userData.userName,
      userAgenceIds: userData.userAgenceIds.split('-')
    };
  } catch (error) {
    console.log('Erreur lors de la récupération des données utilisateur:', error);
    throw error;
  }
}

// Fonction pour charger les agences d'un utilisateur
async function loadUserAgencies(agencyNames: string[]): Promise<void> {
  try {
    const agenciesRef = collection(db, 'agences');
    cachedAgencies = [];
    cachedAgencies.push({
      idAgence: '99',
      nomAgence: 'TOUT',
      libelleAgence: 'TOUT'
    });
    for (const agencyName of agencyNames) {
      if (agencyName !== "-") {
        const q = query(agenciesRef, where('nomAgence', '==', agencyName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const agencyData = querySnapshot.docs[0].data();
          cachedAgencies.push({
            idAgence: agencyData.idAgence,
            nomAgence: agencyData.nomAgence,
            libelleAgence: agencyData.libelleAgence
          });
        }
      }
    }
  } catch (error) {
    console.log('Erreur lors du chargement des agences utilisateur:', error);
    throw error;
  }
}

// Fonction pour charger tous les robots de la collection "robots_et_baremes"
export async function loadAllRobots(): Promise<void> {
  try {
    const robotsRef = collection(db, 'robots_et_baremes');
    const querySnapshot = await getDocs(robotsRef);
    cachedAllRobots = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robot: data["NOM PROGRAMME"],
        id_robot: data.CLEF,
        agence: data.AGENCE,
        description: data.DESCRIPTION,
        date_maj: data["DATE MAJ"],
        type_unite: data.TYPE_UNITE,
        temps_par_unite: data["TEMPS PAR UNITE"].replace(',', '.') || '0',
        type_gain: data["TYPE GAIN"].replace(' (mn)', '').toLowerCase() || '0',
        validateur: data.VALIDATEUR,
        valide_oui_non: data["VALIDE OUI/NON"],
        service: data.SERVICE,
        probleme: data.PROBLEME,
        description_long: data["DESCRIPTION LONG"],
        resultat: data.RESULTAT
      };
    });

    // Pour chaque robot, chercher les données de reporting correspondantes
    cachedAllRobots = cachedAllRobots.map(robot => {
      // Chercher dans cachedReportingData les données correspondantes
      const reportingData = cachedReportingData.find(
        report => report['AGENCE'] + '_' + report['NOM PROGRAMME'] === robot.id_robot
      );
//console.log('####### reportingData', reportingData);
      if (reportingData) {
        //console.log('####### reportingData', reportingData);
        return {
          ...robot,
          currentMonth: reportingData['NB UNITES DEPUIS DEBUT DU MOIS'],
          previousMonth: reportingData['NB UNITES MOIS N-1']
        };
      }
      // console.log('####### robot', robot);
      // console.log('####### robot.id_robot', robot.id_robot);
      return robot;
    });

  } catch (error) {
    console.log('Erreur lors du chargement des robots:', error);
    throw error;
  }
}

// Fonction pour charger tous les robots pour les agences en cache
async function loadAllRobotsForAgencies(): Promise<void> {
  try {
    const robotsRef = collection(db, 'robots_et_baremes'); // Collection "robots_et_baremes"
    const agencyNames = cachedAgencies.map(agency => agency.nomAgence); // liste des agences
    cachedRobots = [];
    console.log('*(dataStore - loadAllRobotsForAgencies) Chargement des ROBOTS des agences :', agencyNames);

    for (const agencyName of agencyNames) {
      // Ne pas charger les robots de l'agence "TOUT"
      if (agencyName !== 'TOUT') {
        const q = query(robotsRef, where('AGENCE', '==', agencyName));
        const querySnapshot = await getDocs(q);

        const robots = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            robot: data["NOM PROGRAMME"],
            id_robot: data.CLEF,
            agence: data.AGENCE,
            description: data.DESCRIPTION,
            data_maj: data["DATE MAJ"],
            type_unite: data.TYPE_UNITE,
            temps_par_unite: data["TEMPS PAR UNITE"].replace(',', '.') || '0',
            type_gain: data["TYPE GAIN"].replace(' (mn)', '').toLowerCase() || '0',
            validateur: data.VALIDATEUR,
            valide_oui_non: data["VALIDE OUI/NON"],
            service: data.SERVICE,
            probleme: data.PROBLEME,
            description_long: data["DESCRIPTION LONG"],
            resultat: data.RESULTAT
          };
        });

        cachedRobots.push(...robots);
      }
    }
  } catch (error) {
    console.log('Erreur lors du chargement des robots:', error);
    throw error;
  }
}

// Fonction pour obtenir les agences en cache
export function getCachedAgencies(): Agency[] {
  return cachedAgencies;
}

// Fonction pour obtenir les robots filtrés par agence
export function getRobotsByAgency(agencyId: string): Program[] {
  // Si l'agence est "TOUT", retourner tous les robots de toutes les agences
  const filteredRobots = agencyId === '99'
    ? cachedRobots // Retourner tous les robots
    : cachedRobots.filter(robot => {
        const agency = cachedAgencies.find(a => a.idAgence === agencyId);
        return robot.agence === agency?.nomAgence;
      });

  // Ajouter l'élément "TOUT" en premier
  const toutRobot: Program = {
    id_robot: 'TOUT',
    robot: 'TOUT',
    agence: 'TOUT',
    type_gain: '0',
    temps_par_unite: '0',
    type_unite: ''
  };

  return [toutRobot, ...filteredRobots];
}

// Fonction pour obtenir les robots filtrés par service
export function getRobotsByService(service: string): Program[] {
  if (!service || service === 'TOUT') {
    return cachedRobots;
  }
  return cachedRobots.filter(robot =>
    (robot.service ?? '').toLowerCase() === service.toLowerCase()
  );
}

// Fonction pour obtenir les robots filtrés par agence et service
export function getRobotsByAgencyAndService(agencyId: string, service: string): Program[] {
  let filteredRobots = cachedRobots;

  // Filtrer par agence si spécifiée
  if (agencyId && agencyId !== 'TOUT') {
    if (agencyId === '99') {
      // Pour l'agence "TOUT", retourner tous les robots
      filteredRobots = cachedRobots;
    } else {
      // Pour une agence spécifique, filtrer par son nom
      const agency = cachedAgencies.find(a => a.idAgence === agencyId);
      if (agency) {
        filteredRobots = filteredRobots.filter(robot => robot.agence === agency.nomAgence);
      }
    }
  }

  // Filtrer par service si spécifié
  if (service && service !== 'TOUT') {
    filteredRobots = filteredRobots.filter(robot =>
      (robot.service ?? '').toLowerCase() === service.toLowerCase()
    );
  }

  // Ajouter l'élément "TOUT" en premier seulement si aucun service n'est spécifié
  if (!service || service === 'TOUT') {
    const toutRobot: Program = {
      id_robot: 'TOUT',
      robot: 'TOUT',
      agence: 'TOUT',
      type_gain: '0',
      temps_par_unite: '0',
      type_unite: ''
    };
    return [toutRobot, ...filteredRobots];
  }

  return filteredRobots;
}

// Fonction pour vérifier si les données sont initialisées
export function isDataInitialized(): boolean {
  return isInitialized;
}

// Fonction pour réinitialiser le cache (utile pour les tests ou la déconnexion)
export function resetCache(): void {
  cachedAgencies = [];
  cachedRobots = [];
  isInitialized = false;
  isFirstLogin = true;
}

export let cachedReportingData: any[] = [];

export async function initializeReportingData(): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, 'DataReportingMoisCourant'));
    cachedReportingData = querySnapshot.docs.map(doc => doc.data());
    console.log('(dataStore) Reporting data cached:', cachedReportingData);
  } catch (error) {
    console.log('Error caching reporting data:', error);
    throw error;
  }
}

// Fonction pour vérifier si c'est la première connexion
export function isFirstLoginSession(): boolean {
  return isFirstLogin;
}

// Fonction pour mettre à jour l'état de la première connexion
export function updateFirstLoginStatus(): void {
  isFirstLogin = false;
}
