import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Variable globale pour stocker tous les programmes
let allRobotsByAgency: Program[] = [];

interface UserData {
  userId: string;
  userName: string;
  userAgenceIds: string[];
}

/**
 * Fetches the user data for the given username from Firestore.
 * @param {string} username - The username to search for.
 * @returns {Promise<UserData | null>} - The user data if found, or null if not found.
 */
export async function fetchUserIdByUsername(username: string): Promise<UserData | null> {
  console.log('Fetching user data for username:', username);
  try {
    const usersRef = collection(db, 'utilisateurs');
    const q = query(usersRef, where('userName', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No user found with username:', username);
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
    console.error('Error fetching user data:', error);
    return null;
  }
}

interface Agency {
  idAgence: string;
  nomAgence: string;
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
  console.log('Fetching agencies for IDs:', agencyIds);
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
            //console.log('Agency data found:', agencyData);
            agencies.push({
              idAgence: agencyData.idAgence,
              nomAgence: agencyData.nomAgence
            });
          } else {
            console.log('No agency found with ID:', agencyId);
          }
        }
    }

    //console.log('All agencies fetched:', agencies);
    return agencies;
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return [];
  }
}

interface Program {
  id_programme: string;
  nom_programme: string;
  id_agence: string;
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
    const programsRef = collection(db, 'programmes');
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
        id_programme: data.id_programme,
        nom_programme: data.nom_programme,
        id_agence: data.id_agence,
        type_gain: data.type_gain,
        bareme: data.bareme
      };
    });
    
    console.log('fetchProgramsByAgencyId(): ', programs);
    return programs;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
}

/**
 * Fetches all robots from Firestore without agency filter
 * @returns An array of all programs
 */
export async function fetchAllRobotsByAgency(agencyId: string): Promise<Program[]> {
  console.log('-- fetchAllRobotsByAgency: id_agence= ', agencyId);
  try {
    const programsRef = collection(db, 'programmes');
    let q;
    if (agencyId === "1") {
      // l'agence est "ALL", on récupérer tous les programmes
      console.log('All agency -> Fetching ALL programs');
      q = query(programsRef);
    } else {
      // filtrer par id_agence
      console.log('Fetching programs for agency ID:', agencyId);
      q = query(programsRef, where('id_agence', '==', agencyId));
    }
    const querySnapshot = await getDocs(q);
    
    let robots = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id_programme: data.id_programme,
        nom_programme: data.nom_programme,
        id_agence: data.id_agence,
        type_gain: data.type_gain,
        bareme: data.bareme
      };
    });
    
    // Trier les robots : "TOUT" en premier, puis par nom
    robots.sort((a, b) => {
      if (a.nom_programme === "TOUT") return -1;
      if (b.nom_programme === "TOUT") return 1;
      return a.nom_programme.localeCompare(b.nom_programme);
    });

    function removeDuplicates(robots: Program[]) {
      const uniqueRobots = [];
      const seenProgramNames = new Set();

      for (const robot of robots) {
        if (!seenProgramNames.has(robot.nom_programme)) {
          seenProgramNames.add(robot.nom_programme);
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
    console.error('Error fetching all programs:', error);
    return [];
  }
}

/**
 * Fetches data from the 'DataReportingMoisCourant' collection in the database,
 * filtered by the specified program name. The function retrieves all documents,
 * processes their date fields to create a comprehensive date object for each
 * entry, and filters the results based on the normalized combination of 'AGENCE'
 * and 'NOM PROGRAMME' matching the provided program name.
 *
 * @param programName - The name of the program to filter the data by.
 * @returns An array of objects containing the date data and other relevant fields
 *          for the matching program, or an empty array if no matches are found.
 */
export async function fetchDataReportingByProgram(programName: string, bareme: string) {
  //console.log('Fetching DataReportingMoisCourant for the robot named:', programName);
  try {
    const querySnapshot = await getDocs(collection(db, 'DataReportingMoisCourant'));
    //console.log('(fetchDataReportingByProgram) Nb robots:', querySnapshot.size);
    
    const documents = querySnapshot.docs.map(doc => doc.data());
    //console.log('All documents:', JSON.stringify(documents, null, 2));

    const data = querySnapshot.docs
      .map(doc => {
        const docData = doc.data();
        //console.log('docData :', docData);
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
          if (docData[dateKey] && docData[dateKey] !== '') {
            dateData[dateKey] = docData[dateKey] +"¤"+ (Number(docData[dateKey]) * Number(bareme));
          }
        }

        // Calculer le gain de temps gagné par unité produite
        const gain: Record<string, number> = Object.keys(dateData).reduce((acc: Record<string, number>, dateKey: string) => {
          acc[dateKey] = (Number(dateData[dateKey]) * Number(bareme));
          return acc;
        }, {});

        return {
          ...dateData,
          AGENCE: docData.AGENCE || '',
          'NOM PROGRAMME': docData['NOM PROGRAMME'] || '',
          'NB UNITES DEPUIS DEBUT DU MOIS': docData['NB UNITES DEPUIS DEBUT DU MOIS'] || '',
          'NB UNITES MOIS N-1': docData['NB UNITES MOIS N-1'] || '',
          'NB UNITES MOIS N-2': docData['NB UNITES MOIS N-2'] || '',
          'NB UNITES MOIS N-3': docData['NB UNITES MOIS N-3'] || ''
          //gain // Ajouter l'attribut "gain" à l'objet de données
        };
      })
      .filter(item => {
        //console.log('Comparing:', {'Item AGENCE + NOM PROGRAMME': item['AGENCE'] +"_"+item['NOM PROGRAMME'], });
        return item['AGENCE'] +"_"+item['NOM PROGRAMME'] === programName;
      });

    //console.log('Processed data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function fetchEvolutionsByProgram(programId: string) {
  //console.log('Fetching evolutions for Programme with ID:', programId);
  try {
    const evolutionsRef = collection(db, 'evolutions');
    const q = query(evolutionsRef, where('Robot', '==', programId));
    const querySnapshot = await getDocs(q);
    
    //console.log('Raw evolutions documents fetched:', querySnapshot.size);
    
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      //console.log('Evolution document data:', docData);
      return {
        id: doc.id,
        ...docData,
        'Date de la demande': docData['Date'] ? new Date(docData['Date']).toLocaleDateString('fr-FR') : ''
      };
    });

    //console.log('Processed evolutions data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching evolutions:', error);
    return [];
  }
}


export async function fetchRandomQuote(): Promise<string | null> {
  console.log('Fetching a random quote...');
  try {
    const quotesRef = collection(db, 'citations');
    const querySnapshot = await getDocs(quotesRef);
    //console.log('Quotes fetched:', querySnapshot.docs);
    if (querySnapshot.empty) {
      console.log('No quotes found.');
      return null;
    }

    const quotes = querySnapshot.docs.map(doc => doc.data().phrase); // Le champ de la citation s'appelle "phrase"
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    console.log('Random quote fetched:', randomQuote);
    return randomQuote;
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return null;
  }
}

/**
 * Fetches and aggregates data for all robots when "TOUT" is selected
 * @returns A matrix of daily totals for all robots (31 days)
 */
export async function fetchAllRobotsData(): Promise<number[][]> {
  console.log('Fetching data for all robots');
  try {
    // Get all robots
    const robots = await fetchAllRobotsByAgency("1"); // "1" = ALL agencies
    if (robots.length === 0) {
      console.log('No robots found');
      return [];
    }

    // Initialize matrix: robots x 31 days
    const matrix: number[][] = Array.from({ length: robots.length }, () => 
      Array.from({ length: 31 }, () => 0)
    );

    // Fetch data for each robot
    for (let i = 0; i < robots.length; i++) {
      const robot = robots[i];
      const data = await fetchDataReportingByProgram(
        robot.id_agence + "_" + robot.nom_programme,
        robot.bareme
      );

      if (data.length > 0) {
        const robotData = data[0];
        
        // Fill matrix with daily values
        Object.entries(robotData).forEach(([date, value]) => {
          if (date.includes('/')) { // Check if it's a date key
            const day = parseInt(date.split('/')[0]) - 1; // Convert to 0-based index
            if (!isNaN(day) && day >= 0 && day < 31) {
              const [units] = String(value).split('¤');
              matrix[i][day] = parseFloat(units) || 0;
            }
          }
        });
      }
    }

    // Calculate daily totals
    const totals = Array.from({ length: 31 }, () => 0);
    for (let day = 0; day < 31; day++) {
      totals[day] = matrix.reduce((sum, robot) => sum + robot[day], 0);
    }

    console.log('All robots data processed');
    return matrix;
  } catch (error) {
    console.error('Error fetching all robots data:', error);
    return [];
  }
}

export async function fetchStatuts() {
  console.log('Fetching statuts...');
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

    console.log('Statuts fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching statuts:', error);
    return [];
  }
}
