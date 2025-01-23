'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface Program {
  id_robot: string;
  nom_robot: string;
  id_agence: string;
  service: string;
  description: string;
  type_gain: string;
  bareme: string;
}

interface ProgramSelectorProps {
  robots: Program[];
  selectedProgramId: string;
  onProgramChange: (program: string) => void;
}

export default function ProgramSelector({ robots, selectedProgramId, onProgramChange }: ProgramSelectorProps) {
  return (
    <Select value={selectedProgramId} onValueChange={onProgramChange}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[400px] text-sm">
        <SelectValue placeholder="Sélectionnez un programme">
          {robots.length === 0 ? "Aucun programme disponible" : robots.find(p => p.id_robot === selectedProgramId)?.nom_robot}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[400px]">
        {robots.map((program) => (
          <SelectItem 
            key={program.id_robot} 
            value={program.id_robot}
            className="text-sm hover:bg-gray-100"
          >
            {program.nom_robot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
