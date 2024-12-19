'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import ProgramSelector from './ProgramSelector'
import Widgets from './Widgets'
import Chart from './Chart'
import ProgramTable from './ProgramTable'
import MergedRequestForm from './MergedRequestForm'
import AgencySelector from './AgencySelector'
import Image from 'next/image';
import { Button } from './ui/button'; // Ajout de l'importation du composant Button
import { 
  fetchUserIdByUsername, 
  fetchAgenciesByIds,
  fetchProgramsByAgencyId,
  fetchDataReportingByProgram,
  fetchEvolutionsByProgram
} from '../utils/dataFetcher'


interface Program {
  id_programme: string;
  nom_programme: string;
  id_agence: string;
}

interface Agency {
  idAgence: string;
  nomAgence: string;
}


export default function Dashboard() {
  const searchParams = useSearchParams();
  const username = searchParams.get('user') || '';
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedProgramData, setSelectedProgramData] = useState<string>('');
  const [historiqueData, setHistoriqueData] = useState<any[]>([]);
  const [programData, setProgramData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false); // État pour contrôler l'ouverture du formulaire

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
        const agencyPrograms = await fetchProgramsByAgencyId(selectedAgency.idAgence);
        console.log('Programs loaded:', agencyPrograms);
        setPrograms(agencyPrograms);
        
        if (agencyPrograms.length > 0) {
          const defaultProgram = agencyPrograms[0];
          console.log('Setting default program:', defaultProgram);
          setSelectedProgram(defaultProgram);
          // Use the exact program name for searching in Firebase
          console.log('Setting program data with name:', defaultProgram.nom_programme);
          setSelectedProgramData(defaultProgram.nom_programme);
        }
      } else {
        console.log('No agency selected, clearing programs');
        setPrograms([]);
        setSelectedProgram(null);
        setSelectedProgramData('');
      }
    };

    loadPrograms();
  }, [selectedAgency]);

  // Load program data when selectedProgramData changes
  useEffect(() => {
    const loadProgramData = async () => {
      if (selectedProgramData) {
        console.log('Loading data for program:', selectedProgramData);
        const data = await fetchDataReportingByProgram(selectedProgramData);
        setProgramData(data);
        
        const historique = await fetchEvolutionsByProgram(selectedProgramData);
        setHistoriqueData(historique);
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
      console.log('Setting program data with name:', program.nom_programme);
      setSelectedProgramData(program.nom_programme);
    }
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  if (isLoading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-x-100">
            <Image src="/logo_bbl-groupe.png" alt="Logo BBL Groupe" width={100} height={70} />
            <div className="ml-20">
              <span className="text-black ">Utilisateur connecté: {user}</span>
              <div className="flex items-center space-x-8 mt-2">
                <div className="flex items-center space-x-2">
                  <span>Agence:</span>
                  <AgencySelector
                    agencies={agencies}
                    selectedAgencyId={selectedAgency?.idAgence || ''}
                    onAgencyChange={handleAgencyChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span>Programme:</span>
                  <ProgramSelector
                    programs={programs}
                    selectedProgramId={selectedProgram?.id_programme || ''}
                    onProgramChange={handleProgramChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 mr-8">
            <Button onClick={handleOpenForm} className="bg-[#000] hover:bg-gray-700 text-white">Nouvelle Demande</Button>
          </div>
        </div>
      </div>

      {isFormOpen && <MergedRequestForm onClose={handleCloseForm} initialProgram={selectedProgram?.nom_programme} />}

      <div className="container mx-auto min-h-screen bg-x-100">
        {selectedProgram && (
          <div className="p-4 bg-x-200">
            <div className="grid grid-cols-4 gap-4 bg-x-100">
              <div className="col-span-4">
                <Chart data={programData?.[0]} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-white-500" style={{ marginTop: 20 }}>
              <div className="col-span-1 flex flex-col space-y-4 bg-white-500">
                <Widgets data={programData?.[0]} />
              </div>
              <div className="col-span-2 flex flex-col">
                <ProgramTable data={historiqueData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
