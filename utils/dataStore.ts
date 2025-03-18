// ------------------------------------------------------------
// FILE: utils/dataStore.ts
// Description : Ce module gère l'accès aux données provenant de Firestore 
// et le stockage en cache pour l'application Dashboard RPA BBL. 
// Il définit notamment les interfaces Agency et Program pour représenter
// les agences et les robots (programmes), ainsi que les fonctions d'initialisation 
// des données et de filtrage des informations par agence/service.
// ------------------------------------------------------------

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cookies } from 'next/headers';

// ============================================================
// Interfaces
// ============================================================

/**
 * Interface pour représentant une agence.
 * Entrée : données issues de Firestore.
 * Sortie : un objet Agency avec id, nom et libellé (optionnel).
 */
export interface Agency {
  idAgence: string;
  nomAgence: string;
  libelleAgence?: string;
}

/**
 * Interface pour représentant un robot ou programme RPA.
 * Contient des informations telles que le nom, l'identifiant, 
 * l'agence associée, les informations de reporting et d'autres 
 * métadata sur le robot.
 */
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

// ============================================================
// Variables globales pour le cache
// ------------------------------------------------------------
// - cachedAgencies: stocke la liste des agences récupérées afin d'éviter 
//   des appels multiples à Firestore pour ces données.
// - cachedAllRobots: stocke l'intégralité des robots récupérés depuis la collection 
//   "robots_et_baremes".
// - cachedRobots: stocke les robots filtrés pour les agences en cache.
// ------------------------------------------------------------
let cachedAgencies: Agency[] = [];
export let cachedAllRobots: Program[] = [];
export let cachedRobots: Program[] = [];
export let cachedServices: string[] = [];

// ============================================================
// Callback pour la mise à jour des robots
// ------------------------------------------------------------
// Ce callback permet au composant parent d'être informé dès que 
// la liste des robots est mise à jour dans le cache.
// ------------------------------------------------------------
let updateRobotsCallback: ((robots: Program[]) => void) | null = null;

/**
 * updateRobots
 * ------------------------------------------------------------
 * Met à jour les robots dans le composant parent via le callback
 * configuré dans updateRobotsCallback. 
 * Entrée:
 *  - robots: Tableau de Program à envoyer.
 * Sortie:
 *  - Aucun retour, mais déclenche une mise à jour dans le composant parent.
 */
export function updateRobots(robots: Program[]): void {
  if (updateRobotsCallback) {
    updateRobotsCallback(robots);
  }
}

/**
 * setUpdateRobotsCallback
 * ------------------------------------------------------------
 * Définit le callback qui sera utilisé pour notifier la mise à jour
 * de la liste des robots.
 * Entrée:
 *  - callback: Fonction qui prend un tableau de Program.
 */
export function setUpdateRobotsCallback(callback: (robots: Program[]) => void): void {
  updateRobotsCallback = callback;
}

// ============================================================
// Variables pour contrôler l'initialisation et la première connexion
// ------------------------------------------------------------
let isInitialized = false;
let isFirstLogin = true;

// ============================================================
// Fonction d'initialisation des données
// ------------------------------------------------------------
/**
 * initializeData
 * -------------------------------------------------------------------
 * Description : 
 *  - Initialise le cache avec les données de l'utilisateur, des agences 
 *    et des robots. Elle récupère d'abord les données utilisateur via fetchUserData.
 *  - Charge ensuite les agences associées à l'utilisateur (loadUserAgencies) 
 *    sauf pour le cas spécial de l'admin (userId === '0').
 *  - Puis charge tous les robots pour ces agences (loadAllRobotsForAgencies).
 * 
 * Entrée : 
 *  - userId (string): Identifiant de l'utilisateur.
 * Sortie : 
 *  - Promise<void> : La fonction met à jour des variables globales en cache.
 * Remarques :
 *  - Si les données ont déjà été initialisées (isInitialized === true), 
 *    la fonction retourne immédiatement pour éviter des appels inutiles.
 */
export async function initializeData(userId: string): Promise<void> {
  if (isInitialized) return;

  try {
    // 1. Récupération des données de l'utilisateur
    const userData = await fetchUserData(userId);
    if (!userData) {
      throw new Error('Utilisateur non trouvé');
    }
    console.log('(dataStore - initializeData) Données utilisateur:', userData);

    // 2. Chargement des agences
    if (userId === '0') {
      // Cas spécial pour l'admin : charger toutes les agences
      //await loadAllAgencies();
      //console.log('(dataStore - initializeData) Toutes les Agences chargées');
    } else {
      // Cas normal : charger les agences liées à l'utilisateur
      await loadUserAgencies(userData.userAgenceIds);
      console.log('## (dataStore - initializeData) Chargement des agences utilisateur', userData.userAgenceIds);
      console.log('## (dataStore - initializeData) Agences chargées', cachedAgencies);
    }

    // 3. Chargement de tous les robots pour ces agences
    await loadAllRobotsForAgencies();
    console.log('(dataStore - loadAllRobotsForAgencies) Chargement des robots', cachedRobots);

    // Marquer l'initialisation comme terminée
    isInitialized = true;
  } catch (error) {
    console.log('Erreur lors de l\'initialisation des données:', error);
    throw error;
  }
}

// ============================================================
// Fonction interne : fetchUserData
// ------------------------------------------------------------
/**
 * fetchUserData
 * -------------------------------------------------------------------
 * Description :
 *  - Récupère les données d'un utilisateur depuis la collection "utilisateurs".
 *  - Utilise une requête pour filtrer par userId.
 * 
 * Entrée :
 *  - userId (string): L'identifiant de l'utilisateur.
 * Sortie :
 *  - Un objet contenant userId, userName, et un tableau userAgenceIds lorsqu'un utilisateur est trouvé,
 *    sinon null.
 */
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

// ============================================================
// Fonction interne : loadUserAgencies
// ------------------------------------------------------------
/**
 * loadUserAgencies
 * -------------------------------------------------------------------
 * Description :
 *  - Charge les agences pour un utilisateur à partir d'un tableau de noms d'agences.
 *  - Commence par réinitialiser le cache des agences et ajoute une agence spéciale "TOUT".
 *  - Pour chaque nom d'agence (autre que "-"), effectue une requête Firestore afin 
 *    de récupérer les données correspondantes et les ajoute au cache s'il n'existe pas déjà.
 * 
 * Entrée :
 *  - agencyNames (string[]): Tableau des noms d'agences associées à l'utilisateur.
 * Sortie :
 *  - Promise<void> : Met à jour la variable globale cachedAgencies.
 */
async function loadUserAgencies(agencyNames: string[]): Promise<void> {
  try {
    const agenciesRef = collection(db, 'agences');
    cachedAgencies = [];
    // Ajout de l'agence "TOUT" par défaut
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
          // Vérifie que l'agence n'est pas déjà présente dans le cache
          if (!cachedAgencies.find(a => a.idAgence === agencyData.idAgence)) {
            cachedAgencies.push({
              idAgence: agencyData.idAgence,
              nomAgence: agencyData.nomAgence,
              libelleAgence: agencyData.libelleAgence
            });
          }
        }
      }
    }
  } catch (error) {
    console.log('Erreur lors du chargement des agences utilisateur:', error);
    throw error;
  }
}

// ============================================================
// Fonction : loadAllRobots
// ------------------------------------------------------------
/**
 * loadAllRobots
 * -------------------------------------------------------------------
 * Description :
 *  - Charge tous les robots depuis la collection "robots_et_baremes" dans Firestore.
 *  - Chaque document est transformé en un objet Program avec les propriétés attendues.
 *  - Ensuite, pour chaque robot, on essaie d'associer des données de reporting depuis cachedReportingData.
 *    Si des données de reporting existent, les valeurs currentMonth et previousMonth sont ajoutées.
 * 
 * Entrée :
 *  - Aucun paramètre.
 * Sortie :
 *  - Promise<void> : Met à jour la variable globale cachedAllRobots.
 */
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

    // Pour chaque robot, essaye de lier les données de reporting
    cachedAllRobots = cachedAllRobots.map(robot => {
      const reportingData = cachedReportingData.find(
        report => report['AGENCE'] + '_' + report['NOM PROGRAMME'] === robot.id_robot
      );
      if (reportingData) {
        return {
          ...robot,
          currentMonth: reportingData['NB UNITES DEPUIS DEBUT DU MOIS'],
          previousMonth: reportingData['NB UNITES MOIS N-1']
        };
      }
      return robot;
    });

  } catch (error) {
    console.log('Erreur lors du chargement des robots:', error);
    throw error;
  }
}

// ============================================================
// Fonction : loadAllRobotsForAgencies
// ------------------------------------------------------------
/**
 * loadAllRobotsForAgencies
 * -------------------------------------------------------------------
 * Description :
 *  - Charge les robots pour toutes les agences présentes dans le cache (cachedAgencies).
 *  - Exclut l'agence "TOUT". Pour chaque agence, effectue une requête pour récupérer
 *    les robots correspondants dans la collection "robots_et_baremes".
 *  - Agrège les robots dans cachedRobots.
 * 
 * Entrée : Aucun
 * Sortie : Promise<void> — Met à jour cachedRobots.
 */
async function loadAllRobotsForAgencies(): Promise<void> {
  try {
    const robotsRef = collection(db, 'robots_et_baremes'); // Collection de robots
    const agencyNames = cachedAgencies.map(agency => agency.nomAgence);
    cachedRobots = [];
    console.log('*(dataStore - loadAllRobotsForAgencies) Chargement des ROBOTS des agences :', agencyNames);

    for (const agencyName of agencyNames) {
      // Ignorer l'agence spéciale "TOUT"
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

// ============================================================
// Fonctions de récupération dans le cache
// ------------------------------------------------------------
/**
 * getCachedAgencies
 * -------------------------------------------------------------------
 * Retourne le tableau des agences en cache.
 * Entrée : Aucun.
 * Sortie : Agency[] — Liste des agences disponibles.
 */
export function getCachedAgencies(): Agency[] {
  return cachedAgencies;
}

/**
 * getRobotsByAgency
 * -------------------------------------------------------------------
 * Description :
 *  - Filtre les robots en fonction de l'ID d'une agence.
 *  - Si l'agence est "TOUT" (id '99'), retourne tous les robots.
 *  - Sinon, filtre les robots dont l'agence correspond au nom de l'agence trouvée dans le cache.
 *  - Ajoute ensuite un robot "TOUT" en position 0 pour permettre une sélection globale.
 * 
 * Entrée :
 *  - agencyId (string) : Identifiant de l'agence sélectionnée.
 * Sortie :
 *  - Program[] : Liste des robots filtrés, avec "TOUT" inclus.
 */
export function getRobotsByAgency(agencyId: string): Program[] {
  const filteredRobots = agencyId === '99'
    ? cachedRobots
    : cachedRobots.filter(robot => {
        const agency = cachedAgencies.find(a => a.idAgence === agencyId);
        return robot.agence === agency?.nomAgence;
      });

  // Robot "TOUT" pour afficher tous les robots
  const toutRobot: Program = {
    id_robot: 'TOUT',
    robot: 'TOUT',
    agence: 'TOUT',
    type_gain: '0',
    temps_par_unite: '0',
    type_unite: ''
  };

  // Éliminer les doublons
  const uniqueRobots = filteredRobots.filter((robot, index, self) =>
    index === self.findIndex(r => r.id_robot === robot.id_robot)
  );
  return [toutRobot, ...uniqueRobots];
}

/**
 * getRobotsByService
 * -------------------------------------------------------------------
 * Description :
 *  - Retourne tous les robots filtrés par service.
 *  - Si le service est "TOUT" ou non spécifié, retourne l'ensemble des robots.
 * 
 * Entrée :
 *  - service (string)
 * Sortie :
 *  - Program[] : Liste des robots filtrés par service.
 */
export function getRobotsByService(service: string): Program[] {
  if (!service || service === 'TOUT') {
    return cachedRobots;
  }
  return cachedRobots.filter(robot =>
    (robot.service ?? '').toLowerCase() === service.toLowerCase()
  );
}

/**
 * getRobotsByAgencyAndService
 * -------------------------------------------------------------------
 * Description :
 *  - Retourne les robots filtrés en fonction de l'agence et du service.
 *  - Si l'agence est "TOUT", retourne tous les robots.
 *  - Sinon, filtre par le nom de l'agence utilisé.
 *  - Ensuite, applique un filtrage par service si spécifié.
 *  - Dans le cas où le service n'est pas défini ou est "TOUT", ajoute le robot "TOUT" dans la liste.
 * 
 * Entrée :
 *  - agencyId (string)
 *  - service (string)
 * Sortie :
 *  - Program[] : Liste des robots filtrés.
 */
export function getRobotsByAgencyAndService(agencyId: string, service: string): Program[] {
  let filteredRobots = cachedRobots;

  // Filtrer par agence si appliqué
  if (agencyId && agencyId !== 'TOUT') {
    if (agencyId === '99') {
      filteredRobots = cachedRobots;
    } else {
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

  const uniqueRobots = filteredRobots.filter((robot, index, self) =>
    index === self.findIndex(r => r.id_robot === robot.id_robot)
  );

  if (!service || service === 'TOUT') {
    const toutRobot: Program = {
      id_robot: 'TOUT',
      robot: 'TOUT',
      agence: 'TOUT',
      type_gain: '0',
      temps_par_unite: '0',
      type_unite: ''
    };
    return [toutRobot, ...uniqueRobots];
  }

  return uniqueRobots;
}

// ============================================================
// Gestion du cache des services
// ------------------------------------------------------------
/**
 * updateService
 * -------------------------------------------------------------------
 * Description :
 *  - Extrait tous les services uniques (non null) des robots et
 *    met à jour le cache cachedServices.
 * 
 * Entrée :
 *  - robots: Program[]
 * Sortie :
 *  - string[] : Liste des services uniques.
 */
export function updateService(robots: Program[]): string[] {
  const services = Array.from(new Set(robots.map(robot => robot.service).filter((s): s is string => !!s)));
  cachedServices = services;
  return services;
}

// ============================================================
// Vérification et réinitialisation de l'initialisation
// ------------------------------------------------------------
/**
 * isDataInitialized
 * -------------------------------------------------------------------
 * Description :
 *  - Retourne true si les données ont déjà été initialisées, false sinon.
 * 
 * Entrée : Aucun.
 * Sortie :
 *  - boolean
 */
export function isDataInitialized(): boolean {
  return isInitialized;
}

/**
 * resetCache
 * -------------------------------------------------------------------
 * Description :
 *  - Réinitialise toutes les variables de cache (agences, robots) et
 *    les indicateurs d'initialisation.
 *  - Utile pour les tests ou lors de la déconnexion de l'utilisateur.
 * 
 * Entrée : Aucun.
 * Sortie : Aucun
 */
export function resetCache(): void {
  cachedAgencies = [];
  cachedRobots = [];
  isInitialized = false;
  isFirstLogin = true;
}

// ============================================================
// Gestion du reporting (données de reporting des robots)
// ------------------------------------------------------------
export let cachedReportingData: any[] = [];

/**
 * initializeReportingData
 * -------------------------------------------------------------------
 * Description :
 *  - Récupère les données de reporting mensuel depuis la collection "DataReportingMoisCourant".
 *  - Pour chaque document, multiplie les valeurs (exprimées pour chaque jour sous le format "jj/mm/aaaa")
 *    par le temps par unité du robot correspondant si applicable.
 *  - Stocke le résultat dans cachedReportingData.
 * 
 * Entrée : Aucun.
 * Sortie : Promise<void>
 */
export async function initializeReportingData(): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, 'DataReportingMoisCourant'));
    cachedReportingData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Trouver le robot correspondant dans cachedAllRobots
      const matchingRobot = cachedAllRobots.find(robot =>
        (robot.robot === data['NOM PROGRAMME'] || robot.id_robot.includes(data['NOM PROGRAMME'])) &&
        robot.agence === data['AGENCE']
      );
      
      // Pour chaque clé correspondant à une date, applique le calcul du gain
      for (const key in data) {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) {
          const originalValue = Number(data[key]);
          if (!isNaN(originalValue)) {
            // Multiplie la valeur par le temps_par_unite si applicable
            if (matchingRobot && matchingRobot.temps_par_unite && matchingRobot.temps_par_unite !== '0') {
              data[key] = (originalValue * Number(matchingRobot.temps_par_unite)).toString();
            }
          }
        }
      }
      
      // Appliquer la même logique de multiplication aux totaux mensuels
      const monthlyTotals = [
        'NB UNITES DEPUIS DEBUT DU MOIS',
        'NB UNITES MOIS N-1',
        'NB UNITES MOIS N-2',
        'NB UNITES MOIS N-3'
      ];
      
      for (const totalKey of monthlyTotals) {
        if (data[totalKey] !== undefined) {
          const originalValue = Number(data[totalKey]);
          if (!isNaN(originalValue)) {
            // Multiplie la valeur par le temps_par_unite si applicable
            if (matchingRobot && matchingRobot.temps_par_unite && matchingRobot.temps_par_unite !== '0') {
              data[totalKey] = (originalValue * Number(matchingRobot.temps_par_unite)).toString();
            }
          }
        }
      }
      
      return data;
    });
    console.log('(dataStore) Reporting data cached:', cachedReportingData);
  } catch (error) {
    console.log('Error caching reporting data:', error);
    throw error;
  }
}

// ============================================================
// Gestion de la première connexion
// ------------------------------------------------------------
/**
 * isFirstLoginSession
 * -------------------------------------------------------------------
 * Description :
 *  - Retourne true si c'est la première session de l'utilisateur,
 *    sinon false.
 */
export function isFirstLoginSession(): boolean {
  return isFirstLogin;
}

/**
 * updateFirstLoginStatus
 * -------------------------------------------------------------------
 * Description :
 *  - Permet de mettre à jour l'état indiquant que l'utilisateur 
 *    n'est plus en première connexion.
 */
export function updateFirstLoginStatus(): void {
  isFirstLogin = false;
}
