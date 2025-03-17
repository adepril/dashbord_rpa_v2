'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import { Agency } from '../utils/dataStore';

interface AgencySelectorProps {
  agencies: Agency[];
  selectedAgencyId: string;
  onAgencyChange: (agencyId: string) => void;
}

import { getRobotsByAgency, cachedRobots, Program, updateRobots } from '../utils/dataStore';

export default function AgencySelector({ agencies, selectedAgencyId, onAgencyChange }: AgencySelectorProps) {
  if (!agencies || agencies.length === 0) {
    return <div>Aucune agence disponible</div>;
  }

const handleAgencyChange = (agencyId: string) => {
  onAgencyChange(agencyId);
  const robots = getRobotsByAgency(agencyId);
  // Mettre à jour la liste des robots dans le composant parent
  updateRobots(robots);
};

  return (
    <Select value={selectedAgencyId || undefined} onValueChange={handleAgencyChange}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[350px] text-sm">
        <SelectValue placeholder="Sélectionnez une agence">
          {agencies.find(a => a.idAgence === selectedAgencyId)?.libelleAgence || agencies.find(a => a.idAgence === selectedAgencyId)?.nomAgence}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[350px]">
        {agencies.map((agency) => {
          const displayText = agency.libelleAgence?.trim() || agency.nomAgence;
          return (
            <SelectItem
              key={agency.idAgence}
              value={agency.idAgence}
              className="text-sm hover:bg-gray-100"
            >
              {displayText}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
