'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import ProgramSelector from './ProgramSelector'
import Chart from './Chart'
import ProgramTable from './ProgramTable'
import Chart4All from './Chart4All'
import MergedRequestForm from './MergedRequestForm'
import AgencySelector from './AgencySelector'
import Image from 'next/image';
import { Button } from './ui/button';
import { 
  fetchUserIdByUsername, 
  fetchAgenciesByIds,
  //fetchProgramsByAgencyId,
  fetchDataReportingByProgram,
  fetchEvolutionsByProgram,
  fetchAllRobotsByAgency
} from '../utils/dataFetcher'


interface Program {
  id_programme: string;
  nom_programme: string;
  id_agence: string;
  type_gain: string;
  bareme: string;
}

interface DataEntry {
  AGENCE: string;
  'NOM PROGRAMME': string;
  'NB UNITES DEPUIS DEBUT DU MOIS': number;
  'NB UNITES MOIS N-1': number;
  'NB UNITES MOIS N-2': number;
  'NB UNITES MOIS N-3': number;
  //gain: Record<string, number>;
  [key: string]: any; // Permet d'accéder aux propriétés dynamiques (dates)
}

interface Agency {
  idAgence: string;
  nomAgence: string;
}

interface MergedRequestFormProps {
  onClose: () => void;
  type?: 'evolution' | 'new' | 'edit';
  formData?: {
    Intitulé: string;
    Description: string;
    Programme: string;
    Nb_operations_mensuelles: string; 
    Temps_consommé: string;
    Statut: string;
    Date: string;
    type: 'new' | 'evolution' | 'edit';
  };
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const username = searchParams.get('user') || '';
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedProgramData, setSelectedProgramData] = useState<Program | null>(null);
  const [historiqueData, setHistoriqueData] = useState<any[]>([]);
  const [programData, setProgramData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [OpenFormNewOrder, setIsFormOpen] = useState(false);
  const [useChart4All, setUseChart4All] = useState(true);

  const router = useRouter();
  const user = searchParams.get('user');

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  // Fetch user data and agencies
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading data for username:', username);
        
        const userData = await fetchUserIdByUsername(username);
        console.log('User data loaded:', userData);
        
        if (!userData) {
          setError('Utilisateur non trouvé');
          return;
        }

        const userAgencies = await fetchAgenciesByIds(userData.userAgenceIds);
        console.log('User agencies loaded:', userAgencies);
        setAgencies(userAgencies);
        
        if (userAgencies.length > 0) {
          console.log('Setting default agency:', userAgencies[0]);
          setSelectedAgency(userAgencies[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };

    if (username) {
      console.log('Starting data load for username:', username);
      loadUserData();
    }
  }, [username]);

  // Fetch programs when selected agency changes
  useEffect(() => {
    const loadPrograms = async () => {
      if (selectedAgency) {
        console.log('Loading programs for agency:', selectedAgency);
        const agencyPrograms = await fetchAllRobotsByAgency(selectedAgency.idAgence);
        console.log('Programs loaded:', agencyPrograms);
        setPrograms(agencyPrograms);
        
        if (agencyPrograms.length > 0) {
          const defaultProgram = agencyPrograms[0];
          console.log('Setting default program:', defaultProgram);
          setSelectedProgram(defaultProgram);
          // Use the exact program name for searching in Firebase
          console.log('Setting program data with name:', defaultProgram.nom_programme);
          setSelectedProgramData(defaultProgram);
        }
      } else {
        console.log('No agency selected, clearing programs');
        setPrograms([]);
        setSelectedProgram(null);
        setSelectedProgramData(null);
      }
    };

    loadPrograms();
  }, [selectedAgency]);

  // Load program data when selectedProgramData changes
  useEffect(() => {
  /**
   * Loads data for the selected program (robot). If the selected program is "TOUT",
   * loads data for all robots of the selected agency and merges their values (day by day) into a single
   * DataEntry object. Otherwise, loads data for the single selected program.
   * @returns {Promise<void>}
   */
    const loadProgramData = async () => {
      if (selectedProgramData) {
        console.log('Loading data for robot :', selectedProgramData);
        
        // Si "TOUT" est sélectionné, charger les données de tous les robots
        if (selectedProgramData.nom_programme === "TOUT") {
          
          const allHistorique = [];
          // Tableau de 31 jours initialisé à 0 (déclaré dans le state du composant)
          let arrJoursDuMois: string[] = new Array(31).fill("0¤0");
          let rawData: DataEntry[] = [];
          console.log('Tableau des jours (arrJoursDuMois) initialisé');

          for (const robot of programs) {

            rawData = await fetchDataReportingByProgram(robot.nom_programme, robot.bareme);

            if (robot.id_agence === selectedAgency?.idAgence && robot.nom_programme !== "TOUT") {
              console.log('(Dashboard) Bot:', robot.nom_programme, ' - rawData: ', rawData);

              // Parcourir chaque entrée de rawData
              for (const entry of rawData) {
                // Parcourir chaque jour du mois
                for (let i = 1; i <= 31; i++) {
                  const dateKey = i.toString().padStart(2, '0') + '/01/2025';
                  
                  if (entry[dateKey]) {
                    // Extraire valeur et gain
                    const [value, gain] = entry[dateKey].split('¤').map(Number);
                    
                    // Récupérer les anciennes valeurs
                    const idx = i - 1;
                    const [oldValue, oldGain] = arrJoursDuMois[idx].split('¤').map(Number);
                    
                    // Calculer les nouvelles valeurs
                    const newValue = oldValue + value;
                    const newGain = oldGain; // + gain;
                    
                    // Mettre à jour le tableau
                    arrJoursDuMois[idx] = `${newValue}¤${newGain}`;
                  }
                }
              }
              
              const historique = await fetchEvolutionsByProgram(robot.nom_programme);
              allHistorique.push(...historique);
            } //fin if
          } //fin itération sur les robots

          // Créer un nouvel objet DataEntry avec les valeurs cumulées
          const mergedData: DataEntry = {
            ...rawData[0], // Copier les propriétés non-journalières
          };
          
          // Remplir les dates avec les valeurs cumulées
          for (let i = 1; i <= 31; i++) {
            const dateKey = i.toString().padStart(2, '0') + '/01/2025';
            mergedData[dateKey] = arrJoursDuMois[i-1];
          }
          
          setProgramData([mergedData]);
          setHistoriqueData(allHistorique);
          setUseChart4All(true);
           console.log('-TOUT- rawData reconstruit:', [mergedData]);
        } else {
          setUseChart4All(false);

          // Charger les données pour un seul robot
          const data = await fetchDataReportingByProgram(selectedProgramData.nom_programme, selectedProgramData.bareme);
          setProgramData(data);

          const historique = await fetchEvolutionsByProgram(selectedProgramData.nom_programme);
          setHistoriqueData(historique);
        }
      }
    };

    loadProgramData();
  }, [selectedProgramData]);

  const handleAgencyChange = (agencyId: string) => {
    const agency = agencies.find(a => a.idAgence === agencyId);
    setSelectedAgency(agency || null);
  };

  const handleProgramChange = (programId: string) => {
    const program = programs.find(p => p.id_programme === programId);
    if (program && selectedAgency) {
      setSelectedProgram(program);
      // Use the exact program name for searching in Firebase
      console.log('(Dashboard.tsx) Setting program data with name:', program.nom_programme);
      setSelectedProgramData(program);
    }
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };


  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <>
      <div>
        <Image src="/logo_bbl-groupe2.png" alt="Logo BBL Groupe" width={100} height={70} />
        <div className="flex bg-x-100 container mx-auto">
         
            <div className="ml-5  bg-x-100">
              <span className="text-black flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2 text-gray-600">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
              </svg> {user}</span>
              <div className="flex space-x-8 mt-2">
                <div className="flex items-center space-x-2">
                  <span>Agence:</span>
                  <AgencySelector
                    agencies={agencies}
                    selectedAgencyId={selectedAgency?.idAgence || ''}
                    onAgencyChange={handleAgencyChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span>Robot:</span>
                  <ProgramSelector
                    programs={programs}
                    selectedProgramId={selectedProgram?.id_programme || ''}
                    onProgramChange={handleProgramChange}
                  />
                  <div className=" bg-red-100"></div>    
                  <div className="flex justify-end bg-x-100 h-[40px]">
                    <button onClick={handleOpenForm} className="bg-neutral-950 text-neutral-100 border border-neutral-400 border-b-4 font-medium overflow-hidden relative px-4 py-1 rounded-lg hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                      <span className="bg-neutral-400 shadow-neutral-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] roundedlg opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_5px_5px_rgba(0,0,0,0.3)]"></span>
                      Nouvelle Demande
                    </button>
                  </div>               
                </div>
              </div>
            </div>
          
        </div>
      </div>

      {OpenFormNewOrder &&  
            <MergedRequestForm
              onClose={handleCloseForm}
              type="new"
              formData={{
                Intitulé: '',
                Description: '',
                Robot: selectedProgram ? selectedProgram.nom_programme : '',
                Temps_consommé: '',
                Nb_operations_mensuelles: '',
                Statut: '1', // Par défaut "En attente de validation"
                Date: new Date().toISOString(),
                type: 'new'
              }}
            /> }

      <div className="container mx-auto min-h-screen bg-x-100">
        {selectedProgram && (
          <div className="p-4 bg-x-200">
            <div className="grid grid-cols-4 gap-4 bg-x-100">
              <div className="col-span-4 pb-8">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                ) : programData ? (
                  useChart4All ? (
                    <Chart4All robotType={selectedProgram?.type_gain} data={programData[0]} />
                  ) : (
                    <Chart robotType={selectedProgram?.type_gain} data={programData[0]} />
                  )
                ) : (
                  <div className="text-red-500">Aucune donnée disponible pour ce programme</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-x-300 mt-5" >

              <div className="col-span-4 w-full">
                <ProgramTable robot={selectedProgram?.nom_programme || ''} data={historiqueData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
