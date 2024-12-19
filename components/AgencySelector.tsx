'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Agency {
  idAgence: string;
  nomAgence: string;
}

interface AgencySelectorProps {
  agencies: Agency[];
  selectedAgencyId: string;
  onAgencyChange: (agencyId: string) => void;
}

export default function AgencySelector({ agencies, selectedAgencyId, onAgencyChange }: AgencySelectorProps) {
  if (!agencies || agencies.length === 0) {
    return <div>Aucune agence disponible</div>;
  }

  return (
    <Select value={selectedAgencyId} onValueChange={onAgencyChange}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[200px] text-sm">
        <SelectValue placeholder="Sélectionnez une agence">
          {agencies.find(a => a.idAgence === selectedAgencyId)?.nomAgence}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[200px]">
        {agencies.map((agency) => (
          <SelectItem 
            key={agency.idAgence} 
            value={agency.idAgence}
            className="text-sm hover:bg-gray-100"
          >
            {agency.nomAgence}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
