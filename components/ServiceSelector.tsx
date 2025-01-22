'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const SERVICES = [
  "TOUT",
  "COMMERCE",
  "EXPLOITATION", 
  "ADMINISTRATIF",
  "DOUANE",
  "DIRECTION"
];

interface ServiceSelectorProps {
  selectedService: string;
  onServiceChange: (service: string) => void;
}

export default function ServiceSelector({ selectedService, onServiceChange }: ServiceSelectorProps) {
  return (
    <Select value={selectedService} onValueChange={onServiceChange}>
      <SelectTrigger className="bg-white border border-gray-300 rounded-md h-9 w-[200px] text-sm">
        <SelectValue placeholder="TOUT">
          {selectedService || "TOUT"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-300 rounded-md w-[200px]">
        {SERVICES.map((service) => (
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
