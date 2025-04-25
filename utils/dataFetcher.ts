import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { describe } from 'node:test';
import { Program } from './dataStore';

// Variable globale pour stocker tous les programmes
export let allRobotsByAgency: Program[] = [];

interface UserData {
  userId: string;
  userName: string;
  userSuperieur: string;
  userValidateur: string;
  userAgenceIds: string[];
}

/**
 * Fetches the user data for the given userId from Firestore.
 * @param {string} userId - The userId to search for.
 * @returns {Promise<UserData | null>} - The user data if found, or null if not found.
 * @deprecated This function is not used in the current implementation.
 */
// export async function fetchUserIdByUserId(userId: string): Promise<UserData | null> {
//   console.log('Fetching user data for userId:', userId);
//   try {
//     const usersRef = collection(db, 'utilisateurs');
//     const q = query(usersRef, where('userId', '==', userId));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       console.log('No user found with userId:', userId);
//       return null;
//     }

//     const userData = querySnapshot.docs[0].data();
//     console.log('User data found:', userData);
//     console.log('userAgenceIds:', userData.userAgenceIds);

//     const userDataFormatted = {
//       userId: userData.userId,
//       userName: userData.userName,
//       userAgenceIds: userData.userAgenceIds || []
//     };
//     console.log('Formatted user data:', userDataFormatted);
//     return userDataFormatted;
//   } catch (error) {
//     console.log('Error fetching user data:', error);
//     return null;
//   }
// }

interface Agency {
  idAgence: string;
  nomAgence: string;
  libelleAgence?: string;
}

/**
 * Fetches all agencies for a given list of IDs.
 * Returns an array of agency objects with idAgence and nomAgence properties.
 * If no agency is found with a given ID, it is skipped.
 * If an error occurs, an empty array is returned.
 * @param agencyIds the list of agency IDs to fetch
 * @returns an array of agency objects
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
// export async function fetchDataReportingByRobot(robotName: string, agence: string, tempsParUnite: string, type_gain: string) {
//   console.log('(#####dataFetcher) fetchDataReportingByRobot - NomProgramme:', robotName, 'Agence:', agence, 'type_gain:', type_gain, 'tempsParUnite:', tempsParUnite);
//   try {
//     const reportingRef = collection(db, 'DataReportingMoisCourant');
//     const q = query(reportingRef, where('NOM PROGRAMME', '==', robotName), where('AGENCE', '==', agence));
//     const querySnapshot = await getDocs(q);
//     console.log('(dataFetcher) Query snapshot:', querySnapshot.docs.map(doc => doc.data()));

//     const data = querySnapshot.docs.map((doc: any) => {
//       const docData = doc.data();
//       const dateData: { [key: string]: string } = {};
//       const currentDate = new Date();
//       const year = currentDate.getFullYear();
//       const month = currentDate.getMonth() + 1;

//       for (let i = 1; i <= 31; i++) {
//         const day = i.toString().padStart(2, '0');
//         const dateKey = `${day}/${month.toString().padStart(2, '0')}/${year}`;
//         if (docData[dateKey] !== undefined && docData[dateKey] !== '') {
//           const execValue = Number(docData[dateKey]);
//           if (tempsParUnite !== '0' && !isNaN(execValue)) {
//             dateData[dateKey] = (execValue * Number(tempsParUnite)).toString();
//           } else {
//             dateData[dateKey] = docData[dateKey];
//           }
//         } else {
//           dateData[dateKey] = '';
//         }
//       }

//       return {
//         ...dateData,
//         AGENCE: docData.AGENCE || 'N/A',
//         'NOM PROGRAMME': docData['NOM PROGRAMME'] || 'N/A',
//         'NB UNITES DEPUIS DEBUT DU MOIS': (!isNaN(Number(docData['NB UNITES DEPUIS DEBUT DU MOIS']))) ?
//           (tempsParUnite === '0' ? Number(docData['NB UNITES DEPUIS DEBUT DU MOIS']) : Number(docData['NB UNITES DEPUIS DEBUT DU MOIS']) * Number(tempsParUnite)) : 0,
//         'NB UNITES MOIS N-1': (!isNaN(Number(docData['NB UNITES MOIS N-1']))) ?
//           (tempsParUnite === '0' ? Number(docData['NB UNITES MOIS N-1']) : Number(docData['NB UNITES MOIS N-1']) * Number(tempsParUnite)) : 0,
//         'NB UNITES MOIS N-2': (!isNaN(Number(docData['NB UNITES MOIS N-2']))) ?
//           (tempsParUnite === '0' ? Number(docData['NB UNITES MOIS N-2']) : Number(docData['NB UNITES MOIS N-2']) * Number(tempsParUnite)) : 0,
//         'NB UNITES MOIS N-3': (!isNaN(Number(docData['NB UNITES MOIS N-3']))) ?
//           (tempsParUnite === '0' ? Number(docData['NB UNITES MOIS N-3']) : Number(docData['NB UNITES MOIS N-3']) * Number(tempsParUnite)) : 0,
//       };
//     });

//     console.log('(dataFetcher) Processed reporting data:', data);
//     return data;
//   } catch (error) {
//     console.log('Error fetching reporting data:', error);
//     return [];
//   }
// }

interface Evolution {
  Robot: string;
  statut: number;
  [key: string]: any; // Pour les autres propriétés dynamiques
}

/**
 * Fetches all evolution documents from the Firestore collection and processes them.
 *
 * Groups the documents by the 'Robot' field and, for each group, retains only the document with the highest 'statut' value.
 * @returns A Promise that resolves to an array of Evolution objects.
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
export async function fetchEvolutionsByProgram(programId: string) {
  try {
    const evolutionsRef = collection(db, 'evolutions');
    const q = query(evolutionsRef, where('Robot', '==', programId));
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
 * Fetches statut documents from the Firestore collection "statut".
 * @returns A Promise that resolves to an array of statut objects with numero and label properties.
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
