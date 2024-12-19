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
import NouvelleDemandeForm from './NouvelleDemandeForm'
import { Button } from "@/components/ui/button"
import { fetchStatuts } from '../utils/dataFetcher'
import MergedRequestForm from './MergedRequestForm'


interface ProgramTableProps {
  data: any[]
}

interface PopupProps {
  row: any;
  statut: string;
  position: { x: number; y: number } | null;
}

function Popup({ row, statut, position }: PopupProps) {
  if (!position) return null;

  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (position) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const popupHeight = 280; // hauteur estimée de la popup
      const popupWidth = 400; // largeur de la popup
      
      // Calculer la position Y
      let yPos = position.y + 10;
      if (yPos + popupHeight > windowHeight) {
        yPos = position.y - popupHeight - 10; // Placer au-dessus du curseur
      }
      
      // Calculer la position X
      let xPos = position.x + 10;
      if (xPos + popupWidth > windowWidth) {
        xPos = position.x - popupWidth - 10; // Placer à gauche du curseur
      }
      
      setPopupPosition({ x: xPos, y: yPos });
    }
  }, [position]);

  return (
    <div
      className="fixed bg-blue-50 p-4 rounded-lg shadow-lg border border-gray-200 z-50"
      style={{
        left: popupPosition.x,
        top: popupPosition.y,
        maxWidth: '400px'
      }}
    >
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Description:</span> {row.Description}
        </div>
        <div>
          <span className="font-semibold">Statut:</span> {statut}
        </div>
        <div>
          <span className="font-semibold">Gain estimé:</span> {row['Gain de temps estimé']}
        </div>
        <div>
          <span className="font-semibold">Temps consommé:</span> {row['Temps consommé']}
        </div>
        <div>
          <span className="font-semibold">Temps estimé:</span> {row['Temps Estimé']}
        </div>
        <div>
          <span className="font-semibold">Tâches mensuelles:</span> {row['Tâches mensuelles']}
        </div>
        <div>
          <span className="font-semibold">User:</span> {row.Utilisateur}
        </div>
      </div>
    </div>
  );
}

export default function ProgramTable({ data }: ProgramTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [popupInfo, setPopupInfo] = useState<{ row: any; position: { x: number; y: number } | null }>({ row: null, position: null });
  const [statuts, setStatuts] = useState<{ [key: string]: string }>({});
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false); // État pour contrôler l'ouverture du formulaire

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

  //ouverture de la popoup
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };
  //fermeture de la popoup
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleRequestClick = (program: string) => {
    setSelectedProgram(program);
    setShowForm(true);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableRowElement>, row: any) => {
    setPopupInfo({
      row,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleMouseLeave = () => {
    setPopupInfo({ row: null, position: null });
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
    <div className="space-y-4 " style={{marginLeft: 100}}>
       
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Evolutions du programme</h2>  
        <Button onClick={handleOpenForm} className="bg-[#000] hover:bg-gray-700 text-white">Demande d'évolution</Button>    
         

      </div>

      <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Intitulé</TableHead>
              <TableHead className="py-2 px-3 text-sm font-bold text-gray-700 border-b">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                onMouseEnter={(e) => handleMouseEnter(e, row)}
                onMouseLeave={handleMouseLeave}
              >
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">{row.Intitulé}</TableCell>
                <TableCell className="py-2 px-3 text-xs text-gray-800 whitespace-normal break-words">
                  {getStatutLabel(row.Statut)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {popupInfo.row && (
        <Popup
          row={popupInfo.row}
          statut={getStatutLabel(popupInfo.row.Statut)}
          position={popupInfo.position}
        />
      )}

      {showForm && (
        <NewRequestForm
          onClose={() => setShowForm(false)}
          initialProgram={selectedProgram}
          type="evolution"
        />
      )}

      {isFormOpen && (
        <MergedRequestForm onClose={handleCloseForm} initialProgram={selectedProgram} type="evolution" />
      )}
    </div>
  );
}