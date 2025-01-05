'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { useToast } from "../hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ClientWrapper } from "./ui/client-wrapper"
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchStatuts } from '../utils/dataFetcher';

interface MergedRequestFormProps {
  onClose: () => void;
  type?: 'evolution' | 'new' | 'edit';
  formData?: {
    Intitulé: string;
    Description: string;
    Robot: string;
    Nb_operations_mensuelles: string; 
    Temps_consommé: string;
    Statut: string;
    Date: string;
    type: 'new' | 'evolution' | 'edit';
  };
}

export default function MergedRequestForm({
  onClose,
  type,
  formData = {
    Intitulé: '',
    Description: '',
    Robot: '',
    Temps_consommé: '',
    Nb_operations_mensuelles: '',
    Statut: '1', // Par défaut "En attente de validation"
    Date: new Date().toLocaleString(),
    type: 'new'
  }
}: MergedRequestFormProps) {
  console.log('MergedRequestForm called with type:', type, 'and formData:', formData); 
  
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('handleSubmit called with formDataState:', formDataState); 

    // Validation des champs obligatoires
    if (!formDataState.Intitulé.trim()) {
      toast({
        title: "Erreur",
        description: "Le champ Intitulé est obligatoire",
        variant: "destructive",
        id: ''
      });
      return;
    }
    if (!formDataState.Description.trim()) {
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
      if (formDataState.type === 'new') {
        await addDoc(evolutionCollection, formDataState);
      } else {
        // Trouver l'enregistrement existant et le mettre à jour
        const querySnapshot = await getDocs(evolutionCollection);
        const matchingDoc = querySnapshot.docs.find((doc) => {
          const data = doc.data();
          return data.Intitulé === formDataState.Intitulé && data.Date === formDataState.Date;
        });
        if (matchingDoc) {
          await updateDoc(matchingDoc.ref, formDataState);
        } else {
          await addDoc(evolutionCollection, formDataState);
        }
      }
      console.error('Envoi des données avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données:', error);
    }

     // Envoi par email
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: "Demande via formulaire",
            email: "noreply@bbl-groupe.fr",
            subject: `Nouvelle demande: ${formData.Intitulé}`,
            message: `Programme: ${formData.Robot}\n\n
            <br>Description: ${formData.Description}\n\n
            <br>Temps consommé: ${formData.Temps_consommé}\n\n
            <br>Statut: ${formData.Statut}\n\n
            <br>${formDataState.type === 'new' ? "Date de création de la demande" : "Date de mise à jour de la demande"} : ${new Date().toLocaleString()}
            `
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
          description: 'Échec de l\'envoi de la demande.',
          variant: 'destructive',
          id: ''
        });
      }

  }

  return (
    <ClientWrapper>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTitle>Formulaire de demande</DialogTitle>
                </TooltipTrigger>
                <TooltipContent>
                  {formDataState.type === 'new' ? (
                    <p>Nouvelle demande</p>
                  ) : (
                    <p>Demande d'évolution du robot {formData.Robot}</p>
                  )}
                  
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="intitulé">Intitulé</Label>
              <Input 
                id="intitulé" 
                name="Intitulé" 
                value={formDataState.Intitulé} 
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="Description" 
                value={formDataState.Description} 
                onChange={handleChange}
              />
            </div>
            {formDataState.type === 'edit' && (
              <>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={formDataState.Statut} 
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
              </>
            )}
            <div>
              <Label htmlFor="Nombre d'opérations mensuelles">Nombre d'opérations mensuelles</Label>
              <Input id="Nombre d'opérations mensuelles" name="Nb_operations_mensuelles" value={formDataState.Nb_operations_mensuelles} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="Temps consommé">Temps consommé (minutes par opération</Label>
              <Input id="Temps consommé" name="Temps_consommé" value={formDataState.Temps_consommé} onChange={handleChange} />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" className="bg-red-500 hover:bg-red-700 text-white" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-700 text-white">Envoyer</Button>
          </div>
          </form>
        </DialogContent>
      </Dialog>
    </ClientWrapper>
  )
}
