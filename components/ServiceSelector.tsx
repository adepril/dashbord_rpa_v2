'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const SERVICES = [
  "TOUT",
  "COMMERCE",
  "EXPLOITATION",
  "ADMINISTRATIF",
  "DOUANE"
];

interface ServiceSelectorProps {
  selectedService: string;
  onServiceChange: (service: string) => void;
}

export default function ServiceSelector({ selectedService, onServiceChange }: ServiceSelectorProps) {
  // Si availableServices n'est pas fourni, utiliser tous les services
  const servicesToShow = SERVICES;

  return (
    <Select value={selectedService} onValueChange={onServiceChange} disabled={true}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[200px] text-sm">
        <SelectValue placeholder="TOUT">
          {selectedService || "TOUT"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[200px]">
        {servicesToShow.map((service) => (
          <SelectItem
            key={service}
            value={service}
            className="text-sm hover:bg-gray-100"
          >
            {service}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
