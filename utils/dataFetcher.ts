import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
      console.log('Fetching agency with ID:', agencyId);
      const q = query(agenciesRef, where('idAgence', '==', agencyId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const agencyData = querySnapshot.docs[0].data();
        console.log('Agency data found:', agencyData);
        agencies.push({
          idAgence: agencyData.idAgence,
          nomAgence: agencyData.nomAgence
        });
      } else {
        console.log('No agency found with ID:', agencyId);
      }
    }

    console.log('All agencies fetched:', agencies);
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
}

  /**
   * Fetches all programs for a given agency ID.
   * If the agency ID is "ALL", fetches all programs.
   * @param agencyId The ID of the agency
   * @returns An array of programs
   */
export async function fetchProgramsByAgencyId(agencyId: string): Promise<Program[]> {
  console.log('Fetching programs for agency ID:', agencyId);
  try {
    const programsRef = collection(db, 'programmes');
    let q;
    if (agencyId === "ALL") {
      // Si l'agence est "ALL", récupérer tous les programmes
      q = query(programsRef);
    } else {
      // Sinon, filtrer par id_agence
      q = query(programsRef, where('id_agence', '==', agencyId));
    }
    console.log("q:", q);
    const querySnapshot = await getDocs(q);
    
    const programs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id_programme: data.id_programme,
        nom_programme: data.nom_programme,
        id_agence: data.id_agence
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
export async function fetchDataReportingByProgram(programName: string) {
  console.log('Fetching DataReportingMoisCourant for program name:', programName);
  try {
    const querySnapshot = await getDocs(collection(db, 'DataReportingMoisCourant'));
    console.log('Raw documents fetched:', querySnapshot.size);
    
    const documents = querySnapshot.docs.map(doc => doc.data());
    console.log('All documents:', JSON.stringify(documents, null, 2));
    
    const data = querySnapshot.docs
      .map(doc => {
        const docData = doc.data();
        //console.log('docData :', docData);
        // Créer un objet avec toutes les dates du mois
        const dateData: { [key: string]: string } = {};
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        // Pour chaque jour du mois
        for (let i = 1; i <= 31; i++) {
          const day = i.toString().padStart(2, '0');
          const dateKey = `${day}/${month.toString().padStart(2, '0')}/${year}`;
          dateData[dateKey] = docData[dateKey] || '';
        }

        return {
          ...dateData,
          AGENCE: docData.AGENCE || '',
          'NOM PROGRAMME': docData['NOM PROGRAMME'] || '',
          'NB UNITES DEPUIS DEBUT DU MOIS': docData['NB UNITES DEPUIS DEBUT DU MOIS'] || '',
          'NB UNITES MOIS N-1': docData['NB UNITES MOIS N-1'] || '',
          'NB UNITES MOIS N-2': docData['NB UNITES MOIS N-2'] || '',
          'NB UNITES MOIS N-3': docData['NB UNITES MOIS N-3'] || ''
        };
      })
      .filter(item => {
        console.log('Comparing:', {
          'Item AGENCE + NOM PROGRAMME': item['AGENCE'] +"_"+item['NOM PROGRAMME'],
          'Search programName': programName
        });
        // Compare program names after normalizing them
        const normalizedItemName = (item['AGENCE'] +"_"+item['NOM PROGRAMME'])?.trim().toLowerCase();
        const normalizedSearchName = programName?.trim().toLowerCase();
        const isMatch = normalizedItemName === normalizedSearchName;
        if (isMatch) {
          console.log('Found matching program:', item['AGENCE'] +"_"+item['NOM PROGRAMME']);
          console.log('Matched item details:', JSON.stringify(item, null, 2));
        }
        return isMatch;
      });
    
    console.log('Filtered DataReportingMoisCourant data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching data reporting:', error);
    return [];
  }
}

export async function fetchEvolutionsByProgram(programId: string) {
  console.log('Fetching evolutions for Programme with ID:', programId);
  try {
    const evolutionsRef = collection(db, 'evolutions');
    const q = query(evolutionsRef, where('Programme', '==', programId));
    const querySnapshot = await getDocs(q);
    
    console.log('Raw evolutions documents fetched:', querySnapshot.size);
    
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      console.log('Evolution document data:', docData);
      return {
        id: doc.id,
        ...docData,
        'Date de la demande': docData['Date de la demande'] ? new Date(docData['Date de la demande']).toLocaleDateString('fr-FR') : '',
        'Date de début': docData['Date de début'] ? new Date(docData['Date de début']).toLocaleDateString('fr-FR') : '',
        'Date de fin': docData['Date de fin'] ? new Date(docData['Date de fin']).toLocaleDateString('fr-FR') : ''
      };
    });

    console.log('Processed evolutions data:', data);
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
