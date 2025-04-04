'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import ProgramSelector from './ProgramSelector'
import Chart from './Chart'
import ProgramTable from './ProgramTable'
import Chart4All from './Chart4All'
import MergedRequestForm from './MergedRequestForm'
import AgencySelector from './AgencySelector'
import ServiceSelector from './ServiceSelector'
import Image from 'next/image';
import { Button } from './ui/button';
import {
  //tchDataReportingByRobot,
  fetchAllEvolutions,
  fetchEvolutionsByProgram,
  formatNumber
} from '../utils/dataFetcher'

import {
  initializeData,
  initializeReportingData,
  getCachedAgencies,
  getRobotsByAgency,
  getRobotsByAgencyAndService,
  Agency,
  Program,
  isDataInitialized,
  resetCache,
  isFirstLoginSession,
  updateRobots,
  setUpdateRobotsCallback,
  cachedReportingData,
  loadAllRobots,
  cachedRobots4Agencies
} from '../utils/dataStore'

// ============================================================
// Interfaces
// ------------------------------------------------------------
// DataEntry : Représente une entrée de reporting pour l'affichage des graphiques.
// MergedRequestFormProps : Interface pour les propriétés passées lors de l'ouverture du formulaire.
// ==
interface DataEntry {
  AGENCE: string;
  'NOM PROGRAMME': string;
  'NB UNITES DEPUIS DEBUT DU MOIS': string;
  'NB UNITES MOIS N-1': string;
  'NB UNITES MOIS N-2': string;
  'NB UNITES MOIS N-3': string;
  [key: string]: any;
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

// ============================================================
// Composant Dashboard
// ------------------------------------------------------------
// Vue principale du tableau de bord qui gère :
// - L'authentification et la redirection si l'utilisateur n'est pas connecté
// - L'initialisation des données utilisateur, agences et robots via Firestore
// - La gestion des sélections (agence, service et robot)
// - L'affichage de graphiques et d'un tableau d'évolution
// - L'ouverture de formulaires pour les demandes
// ============================================================
export default function Dashboard() {
  // ------------------------------------------------------------------
  // États pour divers paramètres et données
  // ------------------------------------------------------------------
  const [showAllRobots, setShowAllRobots] = useState(isFirstLoginSession());
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  const username = userData?.userId || '';
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [availableServices, setAvailableServices] = useState<Set<string>>(new Set(['TOUT']));
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

  // Récupère l'objet router de Next.js pour rediriger l'utilisateur si besoin
  const router = useRouter();

  // ------------------------------------------------------------------
  // Redirection si l'utilisateur n'est pas connecté
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!userData) {
      router.replace('/');
    }
  }, [userData, router]);

  // ------------------------------------------------------------------
  // Initialisation des données (utilisateur, agences, robots, reporting)
  // ------------------------------------------------------------------
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && username) {
      initialized.current = true;
      // Définir le callback pour la mise à jour des robots
      setUpdateRobotsCallback(setPrograms);

      const loadUserData = async () => {
        try {
          setIsLoading(true);
          if (!username || !userData) {
            setError('Utilisateur non trouvé');
            setIsLoading(false);
            return;
          }
          // Initialiser les données en cache dans le bon ordre
          await initializeData(username);
          await loadAllRobots();
          await initializeReportingData();
          
          console.log('@@ (dataStore - initializeData) cachedReportingData :', cachedReportingData);
          console.log('@@ (dataStore - initializeData) cachedRobots4Agencies :', cachedRobots4Agencies);

          // Récupérer les agences depuis le cache
          const userAgencies = getCachedAgencies();
          setAgencies(userAgencies);

          if (userAgencies.length > 0) {
            setSelectedAgency(userAgencies[0]);
          }

          setIsLoading(false);
          console.log('Données chargées - isLoading:', isLoading);
        } catch (error) {
          console.log('Erreur lors du chargement des données:', error);
          setError('Erreur lors du chargement des données');
          setIsLoading(false);
        }
      };

      loadUserData();
    }
    return () => {
      resetCache();
    };
  }, [username]);

  // ------------------------------------------------------------------
  // Mise à jour des programmes quand l'agence ou le service change
  // ------------------------------------------------------------------
  useEffect(() => {
    const loadPrograms = async () => {
      console.log('(Dashboard) l\'agence ou le service change -> Chargement des programmes...');
      if (selectedAgency && isDataInitialized()) {
        // Filtrer les robots en fonction de l'agence sélectionnée
        const allRobots = selectedAgency.idAgence === '99' ? getRobotsByAgency('99') : getRobotsByAgency(selectedAgency.idAgence);
        console.log('Robots chargés:', allRobots);
        setPrograms(allRobots);
        updateService(allRobots);

        if (allRobots.length > 0) {
          const firstRobot = allRobots.find((r: Program) => r.robot === "TOUT") || allRobots[0];
          setSelectedRobot(firstRobot);
          setSelectedRobotData(firstRobot);
          setRobotData(null);
          setRobotData1(null);
          setRobotData2(null);
          setHistoriqueData([]);
          setUseChart4All((prev: boolean) => !prev);
        } else {
          setSelectedRobot(null);
          setSelectedRobotData(null);
        }
      }
    };

    loadPrograms();
  }, [selectedAgency, selectedService]);

  // ------------------------------------------------------------------
  // Chargement des données pour le programme (robot) sélectionné
  // ------------------------------------------------------------------
  useEffect(() => {
    const loadProgramData = async () => {
      if (selectedRobotData) {
        if (selectedRobotData.robot === "TOUT") {
          const allRobotsEvolution: any[] = [];
          let oneRobotEvolution: any[] = [];
          const arrJoursDuMois: string[] = new Array(31).fill("0");
          const arrJoursDuMois_Type1: string[] = [...arrJoursDuMois];
          const arrJoursDuMois_Type2: string[] = [...arrJoursDuMois];
          let rawData: DataEntry[] = [];

          let totalUnitesMoisCourant_Type1 = 0;
          let totalUnitesMoisN1_Type1 = 0;
          let totalUnitesMoisN2_Type1 = 0;
          let totalUnitesMoisN3_Type1 = 0;
          let totalUnitesMoisCourant_Type2 = 0;
          let totalUnitesMoisN1_Type2 = 0;
          let totalUnitesMoisN2_Type2 = 0;
          let totalUnitesMoisN3_Type2 = 0;

          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          let displayMonth = month;
          let displayYear = year;
          if (currentDate.getDate() === 1) {
            if (month === 1) {
              displayMonth = 12;
              displayYear = year - 1;
            } else {
              displayMonth = month - 1;
            }
          }
          const currentMonth = displayMonth.toString().padStart(2, '0');
          const currentYear = displayYear;

          for (const robot of programs) {
            if (robot.robot === "TOUT" || robot.robot === null) continue;
            const tempsParUnite = robot.type_unite !== 'temps' || robot.temps_par_unite === '0' ? '0' : robot.temps_par_unite;
            rawData = cachedReportingData
              .filter(entry => entry['AGENCE'] + "_" + entry['NOM PROGRAMME'] === robot.id_robot)
              .map((entry: any) => ({
                ...entry,
                'NB UNITES DEPUIS DEBUT DU MOIS': String(entry['NB UNITES DEPUIS DEBUT DU MOIS']),
                'NB UNITES MOIS N-1': String(entry['NB UNITES MOIS N-1']),
                'NB UNITES MOIS N-2': String(entry['NB UNITES MOIS N-2']),
                'NB UNITES MOIS N-3': String(entry['NB UNITES MOIS N-3']),
              }));

            if (robot.agence === selectedAgency?.nomAgence || selectedAgency?.nomAgence === "TOUT") {
              const currentProgram = programs.find(p => p.robot === robot.robot);
              const robotType = currentProgram?.type_gain;

              for (const entry of rawData) {
                const unitFactor = robot.type_unite !== 'temps' || robot.temps_par_unite === '0' ? 1 : Number(robot.temps_par_unite);
                if (robotType === 'temps') {
                  totalUnitesMoisCourant_Type1 += (Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0) * unitFactor;
                  totalUnitesMoisN1_Type1 += (Number(entry['NB UNITES MOIS N-1']) || 0) * unitFactor;
                  totalUnitesMoisN2_Type1 += (Number(entry['NB UNITES MOIS N-2']) || 0) * unitFactor;
                  totalUnitesMoisN3_Type1 += (Number(entry['NB UNITES MOIS N-3']) || 0) * unitFactor;
                } else if (robotType === 'autre') {
                  totalUnitesMoisCourant_Type2 += (Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0);
                  totalUnitesMoisN1_Type2 += (Number(entry['NB UNITES MOIS N-1']) || 0);
                  totalUnitesMoisN2_Type2 += (Number(entry['NB UNITES MOIS N-2']) || 0);
                  totalUnitesMoisN3_Type2 += (Number(entry['NB UNITES MOIS N-3']) || 0);
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

              if (selectedAgency.nomAgence !== 'TOUT') {
                oneRobotEvolution = await fetchEvolutionsByProgram(robot.robot);
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
            mergedDataType1[dateKey] = arrJoursDuMois_Type1[i - 1];
            mergedDataType2[dateKey] = arrJoursDuMois_Type2[i - 1];
          }

          if (selectedAgency && selectedAgency.nomAgence === 'TOUT') {
            oneRobotEvolution = await fetchAllEvolutions();
            allRobotsEvolution.push(...oneRobotEvolution);
          }

          setRobotData1(mergedDataType1);
          //setRobotData2(mergedDataType2);
          setHistoriqueData(allRobotsEvolution);
          setUseChart4All((prev: boolean) => !prev);
        } else {
          setUseChart4All(false);
          const tpsParUnit = selectedRobotData.temps_par_unite === '0' ? '0' : selectedRobotData.temps_par_unite;
          const data = cachedReportingData
            .filter(entry => entry['AGENCE'] + "_" + entry['NOM PROGRAMME'] === selectedRobotData.agence + "_" + selectedRobotData.robot)
            .map((entry: any) => ({
             ...entry,
              'NB UNITES DEPUIS DEBUT DU MOIS': tpsParUnit !== '0' ? String(Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) * Number(tpsParUnit)) : String(entry['NB UNITES DEPUIS DEBUT DU MOIS']),
              'NB UNITES MOIS N-1': tpsParUnit !== '0' ? String(Number(entry['NB UNITES MOIS N-1']) * Number(tpsParUnit)) : String(entry['NB UNITES MOIS N-1']),
              'NB UNITES MOIS N-2': tpsParUnit !== '0' ? String(Number(entry['NB UNITES MOIS N-2']) * Number(tpsParUnit)) : String(entry['NB UNITES MOIS N-2']),
              'NB UNITES MOIS N-3': tpsParUnit !== '0' ? String(Number(entry['NB UNITES MOIS N-3']) * Number(tpsParUnit)) : String(entry['NB UNITES MOIS N-3']),
              //...selectedRobot
            }));
          console.log('## data:', data," tpsParUnit:", tpsParUnit);
          setRobotData(data[0]);
          const oneRobotEvolution = await fetchEvolutionsByProgram(selectedRobotData.robot);
          setHistoriqueData(oneRobotEvolution);
        }
      }
    };

    loadProgramData();
  }, [selectedRobotData]);

  // ------------------------------------------------------------------
  // Gestion du changement d'agence
  // ------------------------------------------------------------------
  const handleAgencyChange = (agencyId: string) => {
    const agencySelected = agencies.find(a => a.idAgence === agencyId);
    console.log('--- AGENCY CHANGE ---');
    console.log('Agence choisie:', agencySelected);
    setSelectedAgency(agencySelected || null);
    sessionStorage.setItem('selectedAgencyId', agencyId);

    // Réinitialiser le service à "TOUT"
    setSelectedService('');

    // Réinitialiser les états
    setPrograms([]);
    setSelectedRobot(null);
    setSelectedRobotData(null);
    setRobotData(null);
    setRobotData1(null);
    setRobotData2(null);
    setHistoriqueData([]);

    // Charger les nouveaux robots depuis le cache
    if (agencySelected && isDataInitialized()) {
      const allRobots = agencySelected.idAgence === '99' ? getRobotsByAgency('99') : getRobotsByAgency(agencySelected.idAgence);
      console.log('Robots chargés:', allRobots);
      setPrograms(allRobots);
      updateService(allRobots);
      if (allRobots.length > 0) {
        const firstRobot = allRobots.find((r: Program) => r.robot === "TOUT") || allRobots[0];
        setSelectedRobot(firstRobot);
        setSelectedRobotData(firstRobot);
      }
    }
  };

  // ------------------------------------------------------------------
  // Gestion du changement de robot (programme)
  // ------------------------------------------------------------------
  const handleProgramChange = (robotID: string) => {
    console.log('--- ROBOT CHANGE - robotID:', robotID, '---');
    const program = programs.find(p => p.id_robot === robotID);
    if (program && selectedAgency) {
      setSelectedRobot(program);
      setSelectedRobotData(program);
    } else {
      console.log('_Programme ou agence non trouvé');
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

  const updateService = (filteredRobots: Program[]) => {
    const services = new Set<string>();
    services.add("TOUT");

    filteredRobots.forEach(robot => {
      if (robot.service) {
        services.add(robot.service);
      } else {
        services.add("TOUT");
      }
    });

    setAvailableServices(services);

    if (selectedService && !services.has(selectedService)) {
      setSelectedService("TOUT");
    }
  };

  if (!username) {
    return <div className="text-red-500">Pas d'utilisateur connecté</div>;
  }

  return (
    <>
      <div className='w-full pl-0'>
        <div className="max-w-7xl pl-0">
          <div className='flex items-center pl-0'>
            <div className="flex-none">
              <Image src="/logo_bbl-groupe.svg" alt="Logo BBL Groupe" width={100} height={70} onClick={() => router.push('/')} />
            </div>
            <div className="flex-1 pr-[2%]"></div>
            <div className="flex-none">
              <div className="px-4 bg-x-500">
                <span className="text-black justify-end flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-user w-5 h-5 mr-2 text-gray-600 cursor-pointer"
                    onClick={() => router.push('/')}
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg> {userData.userName}
                </span>
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
                      robots={programs}
                      selectedProgramId={selectedRobot?.id_robot || ''}
                      onProgramChange={handleProgramChange}
                    />
                    <div className="w-[50px]"></div>
                    <div className="flex justify-end bg-x-100 h-[40px]">
                      <button onClick={handleOpenForm} className="bg-neutral-950 text-neutral-100 border border-neutral-400 border-b-4 font-medium relative px-4 py-1 rounded-lg hover:brightness-150 hover:border-t-4 active:opacity-75 duration-300">
                        Nouvelle Demande
                      </button>
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
          user={userData}
          formData={{
            Intitulé: '',
            Description: '',
            Robot: selectedRobot ? selectedRobot.robot : '',
            Temps_consommé: '',
            Nb_operations_mensuelles: '',
            Statut: '1',
            Date: new Date().toISOString(),
            type: 'new'
          }}
        />
      }

      <div className="container mx-auto min-h-screen bg-x-100">
        {selectedRobot && (
          <div className="p-4 bg-x-200">
            <div className="grid grid-cols-4 gap-4 bg-x-100">
              <div className="col-span-4 pb-8">
                {selectedRobot?.robot === 'TOUT' && (
                  <Chart4All
                    key={`all-${selectedAgency?.idAgence}-${selectedRobot?.type_gain}`}
                    robotType={selectedRobot?.type_gain}
                    data1={robotData1}
                  />
                )}
                {selectedRobot?.robot !== 'TOUT' && (
                  <Chart
                    robotType={selectedRobot?.type_gain}
                    data={robotData}
                    selectedAgency={selectedAgency?.idAgence || ''}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-x-300 mt-5">
              <div className="col-span-4 w-full">
                <ProgramTable
                  robot={selectedRobot?.robot || ''}
                  data={historiqueData}
                  typeGain={selectedRobot?.type_gain}
                  useChart4All={useChart4All}
                  user={userData}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
