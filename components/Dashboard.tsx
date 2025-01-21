'use client'

import React, { useState, useEffect } from 'react'
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
  fetchUserIdByUserId, 
  fetchAgenciesByIds,
  fetchDataReportingByRobot,
  fetchAllEvolutions,
  fetchEvolutionsByProgram,
  fetchAllRobotsByAgency,
  formatNumber
} from '../utils/dataFetcher'

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
  'NB UNITES DEPUIS DEBUT DU MOIS': string;
  'NB UNITES MOIS N-1': string;
  'NB UNITES MOIS N-2': string;
  'NB UNITES MOIS N-3': string;
  [key: string]: any;
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
  const [selectedRobot, setSelectedRobot] = useState<Program | null>(null);
  const [selectedRobotData, setSelectedRobotData] = useState<Program | null>(null);
  const [historiqueData, setHistoriqueData] = useState<any[]>([]);
  const [robotData, setRobotData] = useState<any>(null);
  const [robotData1, setRobotData1] = useState<any>(null);
  const [robotData2, setRobotData2] = useState<any>(null);
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
        if (!user) {
          setError('Utilisateur non trouvé');
          setIsLoading(false);
          return;
        }
        const userData = await fetchUserIdByUserId(user);
        
        if (!userData) {
          setError('Utilisateur non trouvé');
          return;
        }

        const userAgencies = await fetchAgenciesByIds(userData.userAgenceIds);
        setAgencies(userAgencies);
        
        if (userAgencies.length > 0) {
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
      loadUserData();
    }
  }, [username]);

  // Fetch programs when selected agency changes
  useEffect(() => {
    const loadPrograms = async () => {
      if (selectedAgency) {
        const agencyPrograms = await fetchAllRobotsByAgency(selectedAgency.idAgence);
        // console.log('@@ selectedAgency :', selectedAgency);
        // console.log('@@ agencyPrograms :', agencyPrograms);
        setPrograms(agencyPrograms);

        // Récupérer l'ID du robot depuis la sessionStorage
        // const storedRobotId = sessionStorage.getItem('selectedRobotId');
        // if (storedRobotId) {
        //   const robotFromStorage = agencyPrograms.find(p => p.id_programme === storedRobotId);
        //   if (robotFromStorage) {
        //     setSelectedRobot(robotFromStorage);
        //     console.log('@ Robot sélectionné depuis sessionStorage:', robotFromStorage.nom_programme);
        //     setSelectedRobotData(robotFromStorage);
        //     return; // Ne pas sélectionner le premier robot par défaut
        //   }
        // }
        
        if (agencyPrograms.length > 0) {
          const defaultProgram = agencyPrograms[0];
          setSelectedRobot(defaultProgram);
          // Use the exact program name for searching in Firebase
          console.log('(loadPrograms) defaultProgram.nom_programme:', defaultProgram.nom_programme);
          setSelectedRobotData(defaultProgram);
        }
      } else {
        console.log('No agency selected, clearing programs');
        setPrograms([]);
        setSelectedRobot(null);
        setSelectedRobotData(null);
      }
    };

    loadPrograms();
  }, [selectedAgency]);

  // Pré-sélectionner l'agence depuis la sessionStorage au chargement
  useEffect(() => {
    const storedAgencyId = sessionStorage.getItem('selectedAgencyId');
    console.log('@@ sessionStorage.getItem("selectedAgencyId"):', storedAgencyId);
    if (storedAgencyId && agencies.length > 0) {
      const agencyFromStorage = agencies.find(a => a.idAgence === storedAgencyId);
      if (agencyFromStorage) {
        setSelectedAgency(agencyFromStorage);
        console.log('@ selectedAgency:', selectedAgency?.nomAgence);
      }
    }
  }, [agencies]);

  useEffect(() => {
  /**
   * Loads data for the selected program (robot). If the selected program is "TOUT",
   * loads data for all robots of the selected agency and merges their values (day by day) into a single
   * DataEntry object. Otherwise, loads data for the single selected program.
   * @returns {Promise<void>}
   */
    const loadProgramData = async () => {
      if (selectedRobotData) {
        // console.log('@@ 1 (combo robot changed:loadProgramData) selectedAgency :', selectedAgency);
        // console.log('@@ 1 (combo robot changed:loadProgramData) selectedRobotData :', selectedRobotData);
        
        // Si "TOUT" est sélectionné, charger les données de tous les robots
        if (selectedRobotData.nom_programme === "TOUT") {
          const allRobotsEvolution = [];
          const allMergedDataType1 = [];
          const allMergedDataType2 = [];

          let oneRobotEvolution: any[] = [];
          // Tableaux de 31 jours initialisés à 0 pour chaque type de robot
          const arrJoursDuMois: string[] = new Array(31).fill("0");
          const arrJoursDuMois_Type1: string[] = [...arrJoursDuMois];
          const arrJoursDuMois_Type2: string[] = [...arrJoursDuMois];
          let rawData: DataEntry[] = [];
          
          // Variables pour stocker les totaux des unités
          let totalUnitesMoisCourant_Type1 = 0;
          let totalUnitesMoisN1_Type1 = 0;
          let totalUnitesMoisN2_Type1 = 0;
          let totalUnitesMoisN3_Type1 = 0;
          let totalUnitesMoisCourant_Type2 = 0;
          let totalUnitesMoisN1_Type2 = 0;
          let totalUnitesMoisN2_Type2 = 0;
          let totalUnitesMoisN3_Type2 = 0;
          
          const currentDate = new Date();
          const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          const currentYear = currentDate.getFullYear();

          for (const robot of programs) {
            // Récupère les données du robot
            rawData = (await fetchDataReportingByRobot(robot.nom_programme, robot.bareme, robot.type_gain)).map((entry: any) => ({
              ...entry,
              'NB UNITES DEPUIS DEBUT DU MOIS': String(entry['NB UNITES DEPUIS DEBUT DU MOIS']),
              'NB UNITES MOIS N-1': String(entry['NB UNITES MOIS N-1']),
              'NB UNITES MOIS N-2': String(entry['NB UNITES MOIS N-2']),
              'NB UNITES MOIS N-3': String(entry['NB UNITES MOIS N-3']),
            }));

            // Vérifier si rawData existe et contient des éléments
            if (!rawData || rawData.length === 0) {
              continue;
            }

            if ((robot.id_agence === selectedAgency?.idAgence || selectedAgency?.nomAgence === "TOUTES") && robot.nom_programme !== "TOUT") {
              // console.log('@@ 2 (lcombo robot changed:oadProgramData) selectedAgency :', selectedAgency);
              // console.log('@@ 2 (combo robot changed:loadProgramData) selectedRobotData :', selectedRobotData);
              const currentProgram = programs.find(p => p.nom_programme === robot.nom_programme);
              const robotType = currentProgram?.type_gain;
              //console.log('@@ 3 (loadProgramData) currentProgram :', currentProgram);

              for (const entry of rawData) {
                if (robotType === 'temps') {
                 totalUnitesMoisCourant_Type1 += Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0;
                 totalUnitesMoisN1_Type1 += Number(entry['NB UNITES MOIS N-1']) || 0;
                 totalUnitesMoisN2_Type1 += Number(entry['NB UNITES MOIS N-2']) || 0;
                 totalUnitesMoisN3_Type1 += Number(entry['NB UNITES MOIS N-3']) || 0;
                } else if (robotType === 'autre') {
                  totalUnitesMoisCourant_Type2 += Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0;
                  totalUnitesMoisN1_Type2 += Number(entry['NB UNITES MOIS N-1']) || 0;
                  totalUnitesMoisN2_Type2 += Number(entry['NB UNITES MOIS N-2']) || 0;
                  totalUnitesMoisN3_Type2 += Number(entry['NB UNITES MOIS N-3']) || 0;
                }

                for (let i = 1; i <= 31; i++) {
                  const dateKey = i.toString().padStart(2, '0') + '/' + currentMonth + '/' + currentYear;
            
                  if (entry[dateKey]) {
                    const value = entry[dateKey];
                    const idx = i - 1;
                    if (robotType === 'temps') {
                      arrJoursDuMois_Type1[idx] = `${Number(arrJoursDuMois_Type1[idx]) + Number(value)}`;
                    } else if (robotType === 'autre') {
                      arrJoursDuMois_Type2[idx] = `${Number(arrJoursDuMois_Type2[idx]) + Number(value)}`;
                    }
                  }
                }
              }
              
              //let oneRobotEvolution: any[] = [];
              if(selectedAgency.nomAgence !== 'TOUTES') {
                oneRobotEvolution = await fetchEvolutionsByProgram(robot.nom_programme);
                //console.log('all oneRobotEvolution', oneRobotEvolution);
                allRobotsEvolution.push(...oneRobotEvolution);
              }
            }
          }

          const mergedDataType1: DataEntry = {
            ...rawData[0],
            'NB UNITES DEPUIS DEBUT DU MOIS': formatNumber(totalUnitesMoisCourant_Type1),
            'NB UNITES MOIS N-1': formatNumber(totalUnitesMoisN1_Type1),
            'NB UNITES MOIS N-2': formatNumber(totalUnitesMoisN2_Type1),
            'NB UNITES MOIS N-3': formatNumber(totalUnitesMoisN3_Type1)
          };
          const mergedDataType2: DataEntry = {
            ...rawData[0],
            'NB UNITES DEPUIS DEBUT DU MOIS': formatNumber(totalUnitesMoisCourant_Type2),
            'NB UNITES MOIS N-1': formatNumber(totalUnitesMoisN1_Type2),
            'NB UNITES MOIS N-2': formatNumber(totalUnitesMoisN2_Type2),
            'NB UNITES MOIS N-3': formatNumber(totalUnitesMoisN3_Type2)
          };

          for (let i = 1; i <= 31; i++) {
            const dateKey = i.toString().padStart(2, '0') + '/' + currentMonth + '/' + currentYear;
            mergedDataType1[dateKey] = arrJoursDuMois_Type1[i-1];
            mergedDataType2[dateKey] = arrJoursDuMois_Type2[i-1];
          }

          if(selectedAgency && selectedAgency.nomAgence === 'TOUTES') {
            oneRobotEvolution = await fetchAllEvolutions();
            allRobotsEvolution.push(...oneRobotEvolution);
          }

          setRobotData1(mergedDataType1);
          setRobotData2(mergedDataType2);     
          setHistoriqueData(allRobotsEvolution);
          setUseChart4All(true);
        
        } else {
          setUseChart4All(false);
          const baremeValue = selectedRobotData.bareme === '' || selectedRobotData.bareme === '0' ? '0' : selectedRobotData.bareme;
          const data = await fetchDataReportingByRobot(selectedRobotData.nom_programme, baremeValue, selectedRobotData.type_gain);
          setRobotData(data[0]);

          const oneRobotEvolution = await fetchEvolutionsByProgram(selectedRobotData.nom_programme);
          console.log('oneRobotEvolution', oneRobotEvolution);
          setHistoriqueData(oneRobotEvolution);
        }
      }
    };

    loadProgramData();
  }, [selectedRobotData]);

  const handleAgencyChange = (agencyId: string) => {
    const agency = agencies.find(a => a.idAgence === agencyId);
    setSelectedAgency(agency || null);
    // Sauvegarder l'agence sélectionnée
    sessionStorage.setItem('selectedAgencyId', agencyId);
    // Réinitialiser les états liés aux robots
    setPrograms([]);
    setSelectedRobot(null);
    setSelectedRobotData(null);
    setRobotData(null);
    setRobotData1(null);
    setRobotData2(null);
    setHistoriqueData([]);

    // Après le chargement des robots, forcer la sélection de "TOUT"
    const loadPrograms = async () => {
      if (agency) {
        const agencyPrograms = await fetchAllRobotsByAgency(agency.idAgence);
        setPrograms(agencyPrograms);
        
        // Sélectionner "TOUT" si disponible
        const toutProgram = agencyPrograms.find(p => p.nom_programme === "TOUT");
        if (toutProgram) {
          setSelectedRobot(toutProgram);
          setSelectedRobotData(toutProgram);
        }
      }
    };
    
    loadPrograms();
  };

  const handleProgramChange = (programId: string) => {
    const program = programs.find(p => p.id_programme === programId);
    if (program && selectedAgency) {
      setSelectedRobot(program);
      // Use the exact program name for searching in Firebase
      //console.log('@@@ (Dashboard.tsx) Setting program data with name:', program.nom_programme);
      setSelectedRobotData(program);
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
    return null;
  }

  return (
    <>
      <div className='w-full pl-0'>
      <div className="max-w-7xl">
        <div className='flex items-center pl-0'>
          <div className="flex-none">
              <Image src="/logo_bbl-groupe.svg" alt="Logo BBL Groupe" width={100} height={70} />
            </div>
            <div className="flex-1"></div>
            <div className="flex-none bg-x-300">
            <div className="px-4">
                <span className="text-black justify-end flex">
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
                      selectedProgramId={selectedRobot?.id_programme || ''}
                      onProgramChange={handleProgramChange}
                    />
                    <div className="w-[50px]"></div>    
                    <div className="flex justify-end bg-x-100 h-[40px]">
                      <button onClick={handleOpenForm} className="bg-neutral-950 text-neutral-100 border border-neutral-400 border-b-4 font-medium overflow-hidden relative px-4 py-1 rounded-lg hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                        <span className="bg-neutral-400 shadow-neutral-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] roundedlg opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_5px_5px_rgba(0,0,0,0.3)]"></span>
                        Nouvelle Demande
                      </button>
{/* 
                      <Button 
                      type="button" 
                      className="bg-blue-500 hover:bg-blue-700 text-white"
                      onClick={() => {
                        if (selectedAgency) {
                          sessionStorage.setItem('selectedAgencyId', selectedAgency.idAgence);
                        }
                        if (selectedRobot) {
                          sessionStorage.setItem('selectedRobotId', selectedRobot.id_programme);
                        }
                        window.location.reload();
                      }}
                    >
                      Ok
                    </Button> */}
                    </div>               
                  </div>
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
                Robot: selectedRobot ? selectedRobot.nom_programme : '',
                Temps_consommé: '',
                Nb_operations_mensuelles: '',
                Statut: '1', // Par défaut "En attente de validation"
                Date: new Date().toISOString(),
                type: 'new'
              }}
            /> }

      <div className="container mx-auto min-h-screen bg-x-100">
        {selectedRobot && (
          <div className="p-4 bg-x-200">
            <div className="grid grid-cols-4 gap-4 bg-x-100">
              <div className="col-span-4 pb-8">
               {useChart4All ? (
                      <Chart4All robotType={selectedRobot?.type_gain} data1={robotData1} data2={robotData2} />
                    ) : ('')}
                {robotData && !useChart4All? (  
                  <Chart robotType={selectedRobot?.type_gain} data={robotData} />
                ) : ('')}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-x-300 mt-5" >
              <div className="col-span-4 w-full">
                <ProgramTable robot={selectedRobot?.nom_programme || ''} data={historiqueData} typeGain={selectedRobot?.type_gain}  useChart4All={useChart4All}/>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
