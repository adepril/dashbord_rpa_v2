'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Program {
  id_programme: string;
  nom_programme: string;
  id_agence: string;
  type_gain: string;
  bareme: string;
}

interface ProgramSelectorProps {
  programs: Program[];
  selectedProgramId: string;
  onProgramChange: (program: string) => void;
}

export default function ProgramSelector({ programs, selectedProgramId, onProgramChange }: ProgramSelectorProps) {
  return (
    <Select value={selectedProgramId} onValueChange={onProgramChange}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[400px] text-sm">
        <SelectValue placeholder="Sélectionnez un programme">
          {programs.length === 0 ? "Aucun programme disponible" : programs.find(p => p.id_programme === selectedProgramId)?.nom_programme}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[400px]">
        {programs.map((program) => (
          <SelectItem 
            key={program.id_programme} 
            value={program.id_programme}
            className="text-sm hover:bg-gray-100"
          >
            {program.nom_programme}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
