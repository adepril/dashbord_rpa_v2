'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import { Program } from '../utils/dataStore';

interface ProgramSelectorProps {
  robots: Program[];
  selectedProgramId: string;
  onProgramChange: (program: string) => void;
}

export default function ProgramSelector({ robots, selectedProgramId, onProgramChange }: ProgramSelectorProps) {
  return (
    <Select value={selectedProgramId} onValueChange={onProgramChange}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[400px] text-sm">
        <SelectValue placeholder={robots.length > 0 ? robots[0].robot : "Aucun programme disponible"}>
          {robots.length === 0 ? "Aucun programme disponible" : robots.find(p => p.id_robot === selectedProgramId)?.robot}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[400px]">
        {robots.map((program) => (
          <SelectItem 
            key={program.id_robot} 
            value={program.id_robot}
            className="text-sm hover:bg-gray-100"
          >
            {program.robot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
