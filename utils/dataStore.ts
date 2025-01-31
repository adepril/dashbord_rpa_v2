import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cookies } from 'next/headers';

// Interfaces
export interface Agency {
  idAgence: string;
  nomAgence: string;
  libelleAgence?: string;
}

export interface Program {
  id_robot: string;
  nom_robot: string;
  id_agence: string;
  service: string;
  description: string;
  type_gain: string;
  bareme: string;
  currentMonth?: number;
  previousMonth?: number;
}

// Variables globales pour le cache
let cachedAgencies: Agency[] = [];
let cachedRobots: Program[] = [];
let isInitialized = false;

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
      await loadAllAgencies();
      console.log('(dataStore - initializeData) Toutes les Agences chargées');
    } else {
      // Cas normal : charger les agences de l'utilisateur
      await loadUserAgencies(userData.userAgenceIds);
      console.log('(dataStore - initializeData) Chargement des agences utilisateur', userData.userAgenceIds);
    }

    // 3. Charger tous les robots pour ces agences
    await loadAllRobotsForAgencies();
    console.log('(dataStore - loadAllRobotsForAgencies) Chargement des robots',cachedRobots);

    isInitialized = true;
  } catch (error) {
    console.log('Erreur lors de l\'initialisation des données:', error);
    throw error;
  }
}

// Fonction pour récupérer les données utilisateur
// This is a TypeScript function named fetchUserData that retrieves user data from a Firestore database.
//  It takes a userId string as input, queries the database for a matching user ID, 
//  and returns an object containing the user's ID, name, and agency IDs (split into an array). 
//  If no matching user is found, it returns null. 
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

// Fonction pour charger toutes les agences (cas admin)
async function loadAllAgencies(): Promise<void> {
  try {
    const agenciesRef = collection(db, 'agences');
    const querySnapshot = await getDocs(agenciesRef);
    
    cachedAgencies = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        idAgence: data.idAgence,
        nomAgence: data.nomAgence,
        libelleAgence: data.libelleAgence
      };
    });
  } catch (error) {
    console.log('Erreur lors du chargement de toutes les agences:', error);
    throw error;
  }
}

// Fonction pour charger les agences d'un utilisateur
async function loadUserAgencies(agencyIds: string[]): Promise<void> {
  try {
    const agenciesRef = collection(db, 'agences');
    cachedAgencies = [];

    for (const agencyId of agencyIds) {
      if (agencyId !== "-") {
        const q = query(agenciesRef, where('idAgence', '==', agencyId));
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

// Fonction pour charger tous les robots pour les agences en cache
async function loadAllRobotsForAgencies(): Promise<void> {
  try {
    const robotsRef = collection(db, 'robots');
    const agencyIds = cachedAgencies.map(agency => agency.idAgence);
    cachedRobots = [];

    for (const agencyId of agencyIds) {
      const q = query(robotsRef, where('id_agence', '==', agencyId));
      const querySnapshot = await getDocs(q);
      
      const robots = querySnapshot.docs.map(doc => {
        const data = doc.data();
        //console.log('(dataStore - loadAllRobotsForAgencies) Chargement des robots',data);
        return {
          id_robot: data.id_robot,
          nom_robot: data.nom_robot,
          id_agence: data.id_agence,
          service: data.service,
          type_gain: data.type_gain,
          description: data.description,
          bareme: data.bareme
        };
      });

      cachedRobots.push(...robots);
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
  const filteredRobots = cachedRobots.filter(robot => robot.id_agence === agencyId);
  
  // Ajouter l'élément "TOUT" en premier
  const toutRobot: Program = {
    id_robot: 'TOUT',
    nom_robot: 'TOUT',
    id_agence: agencyId,
    service: '',
    type_gain: filteredRobots.length > 0 ? filteredRobots[0].type_gain : 'temps',
    description: '',
    bareme: ''
  };

  return [toutRobot, ...filteredRobots];
}

// Fonction pour obtenir les robots filtrés par service
export function getRobotsByService(service: string): Program[] {
  if (!service || service === 'TOUT') {
    return cachedRobots;
  }
  return cachedRobots.filter(robot => 
    robot.service.toLowerCase() === service.toLowerCase()
  );
}

// Fonction pour obtenir les robots filtrés par agence et service
export function getRobotsByAgencyAndService(agencyId: string, service: string): Program[] {
  let filteredRobots = cachedRobots;

  // Filtrer par agence si spécifiée
  if (agencyId && agencyId !== '1') {
    filteredRobots = filteredRobots.filter(robot => robot.id_agence === agencyId);
  }

  // Filtrer par service si spécifié
  if (service && service !== 'TOUT') {
    filteredRobots = filteredRobots.filter(robot => 
      robot.service.toLowerCase() === service.toLowerCase()
    );
  }

  // Ajouter l'élément "TOUT" en premier seulement si aucun service n'est spécifié
  if (!service || service === 'TOUT') {
    const toutRobot: Program = {
      id_robot: 'TOUT',
      nom_robot: 'TOUT',
      id_agence: agencyId,
      service: service,
      type_gain: filteredRobots.length > 0 ? filteredRobots[0].type_gain : 'temps',
      description: '',
      bareme: ''
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
}
