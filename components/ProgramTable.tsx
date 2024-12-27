'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import NewRequestForm from './NewRequestForm'
import { Button } from "@/components/ui/button"
import { fetchStatuts } from '../utils/dataFetcher'
import MergedRequestForm from './MergedRequestForm'


interface ProgramTableProps {
  data: any[]
}


export default function ProgramTable({ data }: ProgramTableProps) {
  const [showForm, setShowForm] = useState(false);
  //const [showForm2, setShowForm2] = useState(false);
  const [popupInfo, setPopupInfo] = useState<{ row: any; position: { x: number; y: number } | null }>({ row: null, position: null });
  const [statuts, setStatuts] = useState<{ [key: string]: string }>({});
  const [selectedProgram, setSelectedProgram] = useState({
    Intitulé: '',
    Description: '',
    Programme: '',
    Temps_consommé: '',
    Taches_mensuelle: '',
    Temps_estimé: '',
    Gain_estimé: '',
    Statut: ''
  });
  const [OpenFormRequestEvolution, setIsFormOpen_Evolution] = useState(false); // État pour contrôler l'ouverture du formulaire de demande d'évolution
  const [OpenFormEdit, setIsFormOpen_Edit] = useState(false); // État pour contrôler l'ouverture du formulaire pour l'édition

  useEffect(() => {
    const loadStatuts = async () => {
      const statutsData = await fetchStatuts();
      const statutsMap: { [key: string]: string } = {};
      statutsData.forEach((statut: any) => {
        statutsMap[statut.numero] = statut.label;
      });
      setStatuts(statutsMap);
    };

    loadStatuts();
  }, []);

  const getStatutLabel = (statutNumero: string) => {
    return statuts[statutNumero] || 'Statut inconnu';
  };

  //ouverture de la popoup pour la demande d'évolution
  const handleOpenForm_Evolution = () => {
    setIsFormOpen_Evolution(true);
  };
  //fermeture de la popoup 
  // pour la demande d'évolution ou la demande d'édition
  const handleCloseForm = () => {
    setIsFormOpen_Evolution(false);
    setIsFormOpen_Edit(false);
  };

  const handleOpenForm_Edit = (
    Intitulé: string,
    Description: string,
    Programme: string,
    Temps_consommé: string,
    Taches_mensuelle: string,
    Temps_estimé: string,
    Gain_estimé: string,
    Statut: string
    ) => {
       setSelectedProgram({
         Intitulé,
         Description,
         Programme,
         Temps_consommé,
         Taches_mensuelle,
         Temps_estimé,
         Gain_estimé,
         Statut
       });
      setIsFormOpen_Edit(true);
  };


  if (!data || data.length === 0) {
    return (
      <div className="space-y-4 " style={{marginLeft: 100}}>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Evolutions du programme</h2>
          <Button variant="default" className="bg-[#000] text-white" onClick={() => setShowForm(true)}>
            Demande d'évolution
          </Button>
        </div>

        <div className="text-center p-4 text-gray-500 h-[400px] "> 
          Aucune donnée disponible sur l'évolution de ce programme.
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-4 " >
       
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Evolutions du programme</h2>  
        <Button onClick={handleOpenForm_Evolution} className="bg-[#000] hover:bg-gray-700 text-white">Demande d'évolution</Button>    
      </div>

      <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Intitulé</TableHead>
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Type</TableHead>
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Statut</TableHead>
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Gains quotidiens</TableHead>
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Dernière mise à jour</TableHead>
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                /* onMouseEnter={(e) => handleMouseEnter(e, row)}
                onMouseLeave={handleMouseLeave} */
              >
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">{row.Intitulé}</TableCell>
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">Nouveau</TableCell>
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">
                  {getStatutLabel(row.Statut)}
                </TableCell>
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">{row['Gain de temps estimé']}</TableCell>
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">N/A</TableCell>
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">
                  <Button onClick={() => handleOpenForm_Edit(row.Intitulé, row.Description, row.Programme, row['Temps consommé'], row['Tâches mensuelles'], row['Temps Estimé'], row['Gain de temps estimé'], row.Statut  )} className="bg-[#000] hover:bg-gray-700 text-white">Editer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {OpenFormRequestEvolution && (
        <MergedRequestForm
          onClose={handleCloseForm}
          type="evolution"
          formData={{
            Intitulé: '',
            Description: '',
            Programme: '',
            Temps_consommé: '',
            Taches_mensuelle: '',
            Temps_estimé: '',
            Gain_estimé: '',
            Statut: '1' // Par défaut "En attente de validation"
          }}
        />
      )}

      {OpenFormEdit && (
        <MergedRequestForm
          onClose={handleCloseForm}
          type="edit"
          formData={selectedProgram}
        />
      )}
    </div>
  );
}
