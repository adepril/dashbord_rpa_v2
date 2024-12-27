'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { useToast } from "../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ClientWrapper } from "./ui/client-wrapper"
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchStatuts } from '../utils/dataFetcher';

interface MergedRequestFormProps {
  onClose: () => void;
  type?: 'evolution' | 'new' | 'edit';
  formData?: {
    Intitulé: string;
    Description: string;
    Programme: string;
    Temps_consommé: string;
    Taches_mensuelle: string;
    Temps_estimé: string;
    Gain_estimé: string;
    Statut: string;
  };
}

export default function MergedRequestForm({
  onClose,
  type = 'new',
  formData = {
    Intitulé: '',
    Description: '',
    Programme: '',
    Temps_consommé: '',
    Taches_mensuelle: '',
    Temps_estimé: '',
    Gain_estimé: '',
    Statut: '1' // Par défaut "En attente de validation"
  }
}: MergedRequestFormProps) {
  const { toast } = useToast();
  const [formDataState, setFormData] = useState(formData);

  const [statuts, setStatuts] = useState<{numero: string, label: string}[]>([]);

  useEffect(() => {
    const loadStatuts = async () => {
      try {
        const statutsData = await fetchStatuts();
        if (!Array.isArray(statutsData) || statutsData.length === 0) {
          console.warn('No statuts data received or invalid format');
          return;
        }
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

    // Validation des champs obligatoires
    if (!formData.Intitulé.trim()) {
      toast({
        title: "Erreur",
        description: "Le champ Intitulé est obligatoire",
        variant: "destructive",
        id: ''
      });
      return;
    }
    if (!formData.Description.trim()) {
      toast({
        title: "Erreur",
        description: "Le champ Description est obligatoire",
        variant: "destructive",
        id: ''
      });
      return;
    }

    try {
      // Envoi à Firebase
      const evolutionCollection = collection(db, 'evolutions');
      await addDoc(evolutionCollection, formData);
      
      // Envoi par email
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Demande via formulaire",
          email: "noreply@bbl-groupe.fr",
          subject: `Nouvelle demande: ${formData.Intitulé}`,
          message: `Programme: ${formData.Programme}\n\nDescription: ${formData.Description}\n\nTemps consommé: ${formData.Temps_consommé}\n\nTâches mensuelles: ${formData.Taches_mensuelle}\n\nTemps estimé: ${formData.Temps_estimé}\n\nGain de temps estimé: ${formData.Gain_estimé}\n\nStatut: ${formData.Statut}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: 'Succès !',
        description: 'Votre demande a été envoyée avec succès.',
        id: ''
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de l\'envoi de la demande. Veuillez réessayer.',
        variant: 'destructive',
        id: ''
      });
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
                disabled={ type === 'edit'}
                className={type === 'new' ? "bg-gray-100" : ""}
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
