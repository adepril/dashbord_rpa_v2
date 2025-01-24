import { collection, getDocs, query, where } from 'firebase/firestore';
//import { formatNumber } from '../components/Dashboard';
import { db } from '../lib/firebase';
import { describe } from 'node:test';
import { Description } from '@radix-ui/react-dialog';

// Variable globale pour stocker tous les programmes
export let allRobotsByAgency: Program[] = [];

interface UserData {
  userId: string;
  userName: string;
  userAgenceIds: string[];
}

/**
 * Fetches the user data for the given userIs from Firestore.
 * @param {string} userId - The userIs to search for.
 * @returns {Promise<UserData | null>} - The user data if found, or null if not found.
 */
export async function fetchUserIdByUserId(userId: string): Promise<UserData | null> {
  console.log('Fetching user data for userId:', userId);
  try {
    const usersRef = collection(db, 'utilisateurs');
    const q = query(usersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No user found with userId:', userId);
      return null;
    }

    const userData = querySnapshot.docs[0].data();
    console.log('User data found:', userData);
    console.log('userAgenceIds:', userData.userAgenceIds);
    
    const userDataFormatted = {
      userId: userData.userId,
      userName: userData.userName,
      userAgenceIds: userData.userAgenceIds || []
    };
    console.log('Formatted user data:', userDataFormatted);
    return userDataFormatted;
  } catch (error) {
    console.log('Error fetching user data:', error);
    return null;
  }
}

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
      if (agencyId!="-") {
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

    //console.log('All agencies fetched:', agencies);
    return agencies;
  } catch (error) {
    console.log('Error fetching agencies:', error);
    return [];
  }
}

interface Program {
  id_robot: string;
  nom_robot: string;
  id_agence: string;
  service: string;
  description: string;
  type_gain: string;
  bareme: string;
}

  /**
   * Fetches all programs for a given agency ID.
   * If the agency ID is "ALL", fetches all programs.
   * @param agencyId The ID of the agency
   * @returns An array of programs
   */
export async function fetchProgramsByAgencyId(agencyId: string): Promise<Program[]> {
  console.log('fetchProgramsByAgencyId for agency ID:', agencyId);
  try {
    const programsRef = collection(db, 'robots');
    let q;
    if (agencyId === "1") {
      // l'agence est "ALL", on récupérer tous les programmes
      //console.log('All agency -> Fetching ALL programs');
      q = query(programsRef);
    } else {
      // filtrer par id_agence
      //console.log('Fetching programs for agency ID:', agencyId);
      q = query(programsRef, where('id_agence', '==', agencyId));
    }

    const querySnapshot = await getDocs(q);
    
    const programs = querySnapshot.docs.map(doc => {
      const data = doc.data();
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
    
    console.log('fetchProgramsByAgencyId(): ', programs);
    return programs;
  } catch (error) {
    console.log('Error fetching programs:', error);
    return [];
  }
}

/**
 * Fetches all robots from Firestore without agency filter
 * @returns An array of all programs
 */
export async function fetchAllRobotsByAgency(agencyId: string, service?: string): Promise<Program[]> {
  console.log('-- fetchAllRobotsByAgency: id_agence= ', agencyId, 'service=', service);
  try {
    const programsRef = collection(db, 'robots');
    let q;
    
    const conditions = [];
    if (agencyId !== "1") {
      conditions.push(where('id_agence', '==', agencyId));
    }
    if (service && service !== "TOUT") {
      conditions.push(where('service', '==', service.toLowerCase()));
    }
    
    if (conditions.length > 0) {
      q = query(programsRef, ...conditions);
    } else {
      q = query(programsRef);
    }
    const querySnapshot = await getDocs(q);
    
    let robots = querySnapshot.docs.map(doc => {
      const data = doc.data();
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
    
    // Trier les robots : "TOUT" en premier, puis par nom
    robots.sort((a, b) => {
      if (a.nom_robot === "TOUT") return -1;
      if (b.nom_robot === "TOUT") return 1;
      return a.nom_robot.localeCompare(b.nom_robot);
    });

    function removeDuplicates(robots: Program[]) {
      const uniqueRobots = [];
      const seenProgramNames = new Set();

      for (const robot of robots) {
        if (!seenProgramNames.has(robot.nom_robot)) {
          seenProgramNames.add(robot.nom_robot);
          uniqueRobots.push(robot);
        }
      }

      return uniqueRobots;
    }

    const uniqueRobots = removeDuplicates(robots);
    robots = uniqueRobots;
    
    // Mettre à jour la variable globale
    allRobotsByAgency = robots;
    console.log('All programs fetched and stored globally:', allRobotsByAgency);
    return robots;
  } catch (error) {
    console.log('Error fetching all programs:', error);
    return [];
  }
}


  /**
   * Récupère les données de reporting mensuel pour un robot
   * @param {string} robotName - nom du robot
   * @param {string} bareme - bareme du robot
   * @param {string} type_gain - type de gain du robot
   * @returns {Promise<{[key: string]: string}[]>} - Données de reporting mensuel pour le robot
   */
export async function fetchDataReportingByRobot(robotName: string, bareme: string, type_gain: string) {
  bareme = bareme.replace(',', '.');
  //console.log('Fetching DataReportingMoisCourant for the robot:', robotName, "bareme:", bareme, 'type_gain:', type_gain);
  try {
    const querySnapshot = await getDocs(collection(db, 'DataReportingMoisCourant'));
    //console.log('(fetchDataReportingByProgram) Nb robots:', querySnapshot.size);
    
    const documents = querySnapshot.docs.map(doc => doc.data());
    //console.log('All documents:', JSON.stringify(documents, null, 2));

    const data = querySnapshot.docs
      .map(doc => {
        const docData = doc.data();
        // Créer un objet avec toutes les dates du mois et leurs valeurs
        const dateData: { [key: string]: string } = {};
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // Pour chaque jour du mois
        for (let i = 1; i <= 31; i++) {
          const day = i.toString().padStart(2, '0');
          const dateKey = `${day}/${month.toString().padStart(2, '0')}/${year}`;
          dateData[dateKey] = '';
          dateData[dateKey] = '';
          if (docData[dateKey] && docData[dateKey] !== '') {
            //console.log('dateKey:', dateKey, 'docData[dateKey]:', docData[dateKey], ' Robot: ', docData['AGENCE'] +"_"+docData['NOM PROGRAMME']);
            dateData[dateKey] = bareme !== '0' && (Number(docData[dateKey])) ? (Number(docData[dateKey]) * Number(bareme)) : docData[dateKey].replace(',', '.');
          }
        }

        return {
          ...dateData,
          AGENCE: docData.AGENCE || 'N/A',
          'NOM PROGRAMME': docData['NOM PROGRAMME'] || 'N/A',
          
          'NB UNITES DEPUIS DEBUT DU MOIS': docData['NB UNITES DEPUIS DEBUT DU MOIS'] && !isNaN(Number(docData['NB UNITES DEPUIS DEBUT DU MOIS'])) ? 
            (bareme === '0' ? Number(docData['NB UNITES DEPUIS DEBUT DU MOIS']) : Number(docData['NB UNITES DEPUIS DEBUT DU MOIS']) * Number(bareme)) : 0,
          'NB UNITES MOIS N-1': docData['NB UNITES MOIS N-1'] && !isNaN(Number(docData['NB UNITES MOIS N-1'])) ? 
            (bareme === '0' ? Number(docData['NB UNITES MOIS N-1']) : Number(docData['NB UNITES MOIS N-1']) * Number(bareme)) : 0,
          'NB UNITES MOIS N-2': docData['NB UNITES MOIS N-2'] && !isNaN(Number(docData['NB UNITES MOIS N-2'])) ? 
            (bareme === '0' ? Number(docData['NB UNITES MOIS N-2']) : Number(docData['NB UNITES MOIS N-2']) * Number(bareme)) : 0,
          'NB UNITES MOIS N-3': docData['NB UNITES MOIS N-3'] && !isNaN(Number(docData['NB UNITES MOIS N-3'])) ? 
            (bareme === '0' ? Number(docData['NB UNITES MOIS N-3']) : Number(docData['NB UNITES MOIS N-3']) * Number(bareme)) : 0,
        };
      })
      .filter(item => {
        //console.log('Comparing:', {'Item AGENCE + NOM PROGRAMME': item['AGENCE'] +"_"+item['NOM PROGRAMME'], });
        return item['AGENCE'] +"_"+item['NOM PROGRAMME'] === robotName;
      });

    //console.log('return  data :', data);
    return data;
  } catch (error) {
    console.log('Error fetching data:', error);
    return [];
  }
}

// export async function fetchAllEvolutions() {
//   console.log('fetchAllEvolutions');
//   try {
//     const evolutionsRef = collection(db, 'evolutions');
//     const q = query(evolutionsRef);
//     const querySnapshot = await getDocs(q);
//     return querySnapshot.docs.map(doc => doc.data());
//   } catch (error) {
//     console.log('Error fetching evolutions:', error);
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
 * - Groups the documents by the 'Robot' field.
 * - For each group, retains only the document with the highest 'statut' value.
 * 
 * @returns A Promise that resolves to an array of Evolution objects,
 *          each representing the document with the highest status for each robot.
 *          If an error occurs during fetching, an empty array is returned.
 */
export async function fetchAllEvolutions(): Promise<Evolution[]> {
  console.log('fetchAllEvolutions');
  try {
    const evolutionsRef = collection(db, 'evolutions');
    const q = query(evolutionsRef);
    const querySnapshot = await getDocs(q);
    
    // Grouper les documents par Robot
    const groupedByRobot = querySnapshot.docs.reduce<Record<string, Evolution[]>>((acc, doc) => {
      const data = doc.data() as Evolution;
      const robot = data.Robot;
      if (!acc[robot]) {
        acc[robot] = [];
      }
      acc[robot].push(data);
      return acc;
    }, {});

    // Pour chaque Robot, garder uniquement le document avec le statut le plus élevé
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
 * 
 * @param programId The name of the program to fetch evolutions for.
 * @returns A Promise that resolves to an array of objects,
 *          each representing an evolution document that matches the program name.
 *          If an error occurs during fetching, an empty array is returned.
 */
export async function fetchEvolutionsByProgram(programId: string) {
  //console.log('Fetching evolutions for Programme with name:', programId);
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

    //console.log('Processed evolutions data:', data);
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
 * @returns A Promise that resolves to a random `Quote` object, or null if an error occurs or no quotes are found.
 */
export async function fetchRandomQuote(): Promise<Quote | null> {
  //console.log('Fetching a random quote...');
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
    //console.log('Random quote fetched:', randomQuote);
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
   * 
   * @returns A Promise that resolves to an array of objects,
   *          each representing a statut document with `numero` and `label` properties.
   *          If an error occurs during fetching, an empty array is returned.
   */
export async function fetchStatuts() {
  //console.log('Fetching statuts...');
  try {
    const querySnapshot = await getDocs(collection(db, 'statut')); 
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        numero: docData.numero,
        label: docData.name || docData.label || ''
      };
    });
    // Trier les statuts par ordre ascendant selon le champ "numero"
    data.sort((a, b) => a.numero - b.numero);

    //console.log('Statuts fetched:', data);
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
    // Séparer partie entière et décimale
    const [entier, decimal] = num.toFixed(2).split('.');
    //console.log('entier:', entier);
    //console.log('decimal:', decimal);
    // Convertir la partie décimale en base 60 (minutes)
    const minutes = Math.round(Number(decimal) * 0.6);
    
    // Formater les minutes avec 2 chiffres
    const formattedMinutes = String(minutes).padStart(2, '0');
    
    //return `${entier}.${formattedMinutes}`;
    return `${entier}`;
  }
};

// Fonction pour formater les nombres 
// export const formatNumber = (num: number) => {
//   if (Number.isInteger(num)) {
//     return num.toString();
//   } else {
//     let formatted = num.toFixed(2);
//     //console.log('formatted:', formatted);
//     formatted = formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
//     return formatted;
//   }
// };
