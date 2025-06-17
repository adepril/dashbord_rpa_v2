import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { describe } from 'node:test';
import { Program } from './dataStore';

// ------------------------------------------------------------
// ROLE: Service de récupération des données Firestore
//
// Ce module fournit des fonctions spécifiques pour:
// 1. Récupérer des entités individuelles (agences, utilisateurs, citations)
// 2. Effectuer des requêtes filtrées (par programme, statut, etc.)
// 3. Transformer les données brutes en structures typées
//
// Différences avec dataStore.ts:
// - Pas de gestion de cache (seulement des requêtes directes)
// - Pas de calculs complexes (uniquement la récupération)
// - Pas de callbacks UI (retourne des Promises)
//
// Variables globales:
// - allRobotsByAgency: Liste temporaire des robots par agence
// ------------------------------------------------------------

// Variable globale pour stocker tous les programmes
export let allRobotsByAgency: Program[] = [];

interface UserData {
  userId: string;
  userName: string;
  userSuperieur: string;
  userValidateur: string;
  userAgenceIds: string[];
}



interface Agency {
  idAgence: string;
  nomAgence: string;
  libelleAgence?: string;
}

/**
 * fetchAgenciesByIds - Récupère les agences correspondant aux IDs fournis
 *
 * Cette fonction:
 * 1. Prend en entrée une liste d'IDs d'agences
 * 2. Effectue une requête Firestore pour chaque ID valide (!= "-")
 * 3. Retourne un tableau d'objets Agency formatés
 *
 * Gestion des erreurs:
 * - Ignore les IDs invalides (log dans la console)
 * - Retourne tableau vide en cas d'erreur globale
 *
 * @param agencyIds string[] - Liste des IDs d'agences à récupérer
 * @returns Promise<Agency[]> - Tableau des agences trouvées
 *
 * Exemple d'utilisation:
 * const agencies = await fetchAgenciesByIds(['AG1', 'AG2'])
 */
export async function fetchAgenciesByIds(agencyIds: string[]): Promise<Agency[]> {
  console.log('Retrieve agencies for IDs:', agencyIds);
  try {
    const agenciesRef = collection(db, 'agences');
    const agencies: Agency[] = [];

    for (const agencyId of agencyIds) {
      if (agencyId !== "-") {
        console.log('Fetching agency with ID:', agencyId);
        const q = query(agenciesRef, where('idAgence', '==', agencyId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const agencyData = querySnapshot.docs[0].data();
          console.log('Agency data found:', agencyData);
          agencies.push({
            idAgence: agencyData.idAgence,
            nomAgence: agencyData.nomAgence,
            libelleAgence: agencyData.libelleAgence
          });
        } else {
          console.log('No agency found with ID:', agencyId);
        }
      }
    }

    return agencies;
  } catch (error) {
    console.log('Error fetching agencies:', error);
    return [];
  }
}

/**
 * Récupère les données de reporting mensuel pour un robot.
 * Utilise une requête Firestore filtrant par 'NOM PROGRAMME' et 'AGENCE'.
 * Pour chaque enregistrement, pour les 31 jours du mois, multiplie la valeur du nombre d'exécutions par le temps par unité, 
 * même si cette valeur est 0, à condition que tempsParUnite ne soit pas "0".
 * @param {string} robotName - Nom du robot.
 * @param {string} agence - Nom de l'agence.
 * @param {string} tempsParUnite - Gain de temps unitaire.
 * @param {string} type_gain - Type de gain (non utilisé dans ce contexte).
 * @returns {Promise<{[key: string]: string}[]>} - Données de reporting mensuel.
 */


interface Evolution {
  Robot: string;
  statut: number;
  [key: string]: any; // Pour les autres propriétés dynamiques
}

/**
 * fetchAllEvolutions - Récupère et traite tous les documents d'évolution
 *
 * Cette fonction:
 * 1. Récupère tous les documents de la collection 'evolutions'
 * 2. Groupe les documents par champ 'Robot'
 * 3. Pour chaque groupe, conserve uniquement le document avec le 'statut' le plus élevé
 *
 * Typage:
 * - Retourne Promise<Evolution[]>
 * - Evolution contient obligatoirement Robot (string) et statut (number)
 *
 * Gestion des erreurs:
 * - Retourne tableau vide en cas d'erreur
 * - Log l'erreur dans la console
 *
 * @returns Promise<Evolution[]> - Tableau des évolutions filtrées
 *
 * Note: Utilisé pour afficher uniquement la dernière version de chaque évolution
 */
export async function fetchAllEvolutions(): Promise<Evolution[]> {
  console.log('fetchAllEvolutions');
  try {
    const evolutionsRef = collection(db, 'evolutions');
    const q = query(evolutionsRef);
    const querySnapshot = await getDocs(q);

    const groupedByRobot = querySnapshot.docs.reduce<Record<string, Evolution[]>>((acc, doc) => {
      const data = doc.data() as Evolution;
      const robot = data.Robot;
      if (!acc[robot]) {
        acc[robot] = [];
      }
      acc[robot].push(data);
      return acc;
    }, {});

    const filteredResults = Object.values(groupedByRobot).map((robotDocs) => {
      return robotDocs.reduce((maxDoc, currentDoc) => {
        return (currentDoc.statut > maxDoc.statut) ? currentDoc : maxDoc;
      });
    });

    return filteredResults;
  } catch (error) {
    console.log('Error fetching evolutions:', error);
    return [];
  }
}

/**
 * Fetches evolution documents from the Firestore collection for a given program name.
 * @param programId The name of the program to fetch evolutions for.
 * @returns A Promise that resolves to an array of evolution documents.
 */
function getMonthRange(selectedMonth: string) {
  const currentDate = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (selectedMonth !== 'N') {
    const monthOffset = parseInt(selectedMonth.split('-')[1]);
    startDate.setMonth(startDate.getMonth() - monthOffset);
    endDate.setMonth(endDate.getMonth() - monthOffset);
  }

  startDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  return { startDate, endDate };
}

export async function fetchEvolutionsByProgram(programId: string, selectedMonth: string = 'N') {
  try {
    const evolutionsRef = collection(db, 'evolutions');
    const { startDate, endDate } = getMonthRange(selectedMonth);
    const q = query(
      evolutionsRef,
      where('Robot', '==', programId),
      where('Date', '>=', startDate),
      where('Date', '<=', endDate)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        'Date de la demande': docData['Date'] ? new Date(docData['Date']).toLocaleDateString('fr-FR') : ''
      };
    });

    return data;
  } catch (error) {
    console.log('Error fetching evolutions:', error);
    return [];
  }
}

interface FirestoreQuote {
  citation: string;
  auteur: string;
}

export interface Quote {
  id: string;
  citation: string;
  auteur: string;
}

/**
 * Fetches a random quote from Firestore.
 * @returns A Promise that resolves to a random Quote object, or null if no quote is available.
 */
export async function fetchRandomQuote(): Promise<Quote | null> {
  try {
    const quotesRef = collection(db, 'citations');
    const querySnapshot = await getDocs(quotesRef);
    if (querySnapshot.empty) {
      console.log('No quotes found.');
      return null;
    }

    const quotes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as FirestoreQuote
    }));
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return {
      id: randomQuote.id,
      citation: randomQuote.citation,
      auteur: randomQuote.auteur
    };
  } catch (error) {
    console.log('Error fetching random quote:', error);
    return null;
  }
}

/**
 * fetchStatuts - Récupère tous les statuts depuis Firestore
 *
 * Cette fonction:
 * 1. Récupère tous les documents de la collection 'statut'
 * 2. Transforme les données en objets {numero, label}
 * 3. Trie les statuts par numéro croissant
 *
 * Structure de retour:
 * - numero: number (identifiant unique du statut)
 * - label: string (libellé du statut)
 *
 * Gestion des erreurs:
 * - Retourne tableau vide en cas d'erreur
 * - Log l'erreur dans la console
 *
 * @returns Promise<Array<{numero: number, label: string}>>
 *
 * Note: Utilisé pour les filtres et affichages des statuts
 */
export async function fetchStatuts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'statut'));
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        numero: docData.numero,
        label: docData.name || docData.label || ''
      };
    });
    data.sort((a, b) => a.numero - b.numero);
    return data;
  } catch (error) {
    console.log('Error fetching statuts:', error);
    return [];
  }
}

// Fonction pour formater les nombres
export const formatNumber = (num: number) => {
  if (Number.isInteger(num)) {
    return num.toString();
  } else {
    const [entier, decimal] = num.toFixed(2).split('.');
    const minutes = Math.round(Number(decimal) * 0.6);
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${entier}`;
  }
};

/**
 * Fetches all users from the Firestore collection "utilisateurs".
 * @returns A Promise that resolves to an array of user objects with userId and userName properties.
 */
export async function fetchAllUsers(): Promise<{ userId: string; userName: string }[]> {
  try {
    const usersRef = collection(db, 'utilisateurs');
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        userId: userData.userId,
        userName: userData.userName,
      };
    });
    return users;
  } catch (error) {
    console.log('Error fetching users:', error);
    return [];
  }
}
