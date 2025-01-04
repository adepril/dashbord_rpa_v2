'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchStatuts } from '../utils/dataFetcher';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ClientWrapper } from "@/components/ui/client-wrapper"

interface NewRequestFormProps {
  onClose: () => void;
  initialProgram?: string;
  type?: 'evolution' | 'new';
}

export default function NewRequestForm({ onClose, initialProgram, type = 'new' }: NewRequestFormProps) {
  const [formData, setFormData] = useState({
    Intitulé: '',
    Description: '',
    Programme: initialProgram || '',
    Temps_consommé: '',
    Taches_mensuelle: '',
    Temps_estimé: '',
    Gain_estimé: '',
    Statut: '1' // Par défaut "En attente de validation"
  })

  const [statuts, setStatuts] = useState<{numero: string, label: string}[]>([]);

  useEffect(() => {
    const loadStatuts = async () => {
      try {
        console.log('Starting to load statuts...');
        const statutsData = await fetchStatuts();
        console.log('Raw statuts data:', statutsData);
        
        if (!Array.isArray(statutsData) || statutsData.length === 0) {
          console.warn('No statuts data received or invalid format');
          return;
        }

        console.log('Mapped statuts:', statutsData);
        setStatuts(statutsData);
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    };
    loadStatuts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, Statut: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData)

    // Validation des champs obligatoires
    if (!formData.Intitulé.trim()) {
      alert("Le champ Intitulé est obligatoire");
      return;
    }
    if (!formData.Description.trim()) {
      alert("Le champ Description est obligatoire");
      return;
    }

    try {
      const evolutionCollection = collection(db, 'evolutions');
      await addDoc(evolutionCollection, formData);
      console.log('Données envoyées avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données :', error);
    }
  }

  return (
    <ClientWrapper className="contents">
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{type === 'evolution' ? "Demande d'évolution" : "Nouvelle demande"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="Intitulé">Intitulé</Label>
              <Input id="Intitulé" name="Intitulé" value={formData.Intitulé} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="Description">Description</Label>
              <Textarea id="Description" name="Description" value={formData.Description} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="programme">Programme</Label>
              <Input 
                id="programme" 
                name="Programme" 
                value={formData.Programme} 
                onChange={handleChange}
                disabled={!!initialProgram || type === 'new'}
                className={initialProgram || type === 'new' ? "bg-gray-100" : ""}
              />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={formData.Statut} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="bg-white border border-gray-300 rounded py-2 px-4">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded py-2 px-4">
                  {statuts && statuts.length > 0 ? (
                    statuts.map((statut, index) => (
                      <SelectItem 
                        key={`${statut.numero}-${index}`} 
                        value={statut.numero}
                      >
                        {statut.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Chargement des statuts...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="Temps consommé">Temps consommé</Label>
              <Input id="Temps consommé" name="Temps_consommé" value={formData.Temps_consommé} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="Tâches mensuelles">Tâches mensuelles</Label>
              <Input id="Tâches mensuelles" name="Taches_mensuelle" value={formData.Taches_mensuelle} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="Temps Estimé">Temps Estimé</Label>
              <Input id="Temps Estimé" name="Temps_estimé" value={formData.Temps_estimé} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="Gain de temps estimé">Gain de temps estimé</Label>
              <Input id="Gain de temps estimé" name="Gain_estimé" value={formData.Gain_estimé} onChange={handleChange} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" className="bg-red-500 hover:bg-red-700 text-white" onClick={onClose}>Annuler</Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-700 text-white">Envoyer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientWrapper>
  )
}
