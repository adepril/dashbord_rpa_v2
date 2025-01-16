'use client'
import React from 'react';

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
import { stat } from 'fs';

interface MergedRequestFormProps {
  onClose: () => void;
  type?: 'evolution' | 'new' | 'edit';
  typeGain?: string;
  formData?: {
    Intitulé: string;
    Description: string;
    Robot: string;
    Nb_operations_mensuelles: string; 
    Temps_consommé: string;
    Statut: string;
    Date: string;
    type: 'new' | 'evolution' | 'edit';
    type_gain?: string;
  };
}

export default function MergedRequestForm({
  onClose,
  type,
  typeGain,
  formData = {
    Intitulé: '',
    Description: '',
    Robot: '',
    Temps_consommé: '',
    Nb_operations_mensuelles: '',
    Statut: '1', // Par défaut "En attente de validation"
    Date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    type: 'new',
    type_gain: '',
  }
}: MergedRequestFormProps) {
  //console.log('MergedRequestForm called with type:', type, 'and formData:', formData); 

  const { toast } = useToast();
  const [formDataState, setFormData] = useState({
    ...formData,
    Nb_operations_mensuelles: formData.Nb_operations_mensuelles || '',
    Temps_consommé: formData.Temps_consommé || ''
  });
  const [statuts, setStatuts] = useState<{numero: string, label: string}[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  console.log('MergedRequestForm called with type:', type, 'and formDataState:', formDataState);

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

  /**
   * Gère l'envoi du formulaire de demande.
   * @param {React.FormEvent<HTMLFormElement>} e - L'événement de soumission du formulaire
   * 
   * Valide les champs obligatoires puis envoie les données à Firebase.
   * Si l'envoi est un succès, envoie un e-mail via le serveur Next.js.
   * Si l'envoi est un échec, affiche un toast d'erreur.
   * Puis ferme le formulaire.
   */
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    // Vérifier si des modifications ont été apportées
    const hasChanges = Object.keys(formDataState).some(key => {
      const originalValue = formData[key as keyof typeof formData];
      const currentValue = formDataState[key as keyof typeof formDataState];
      return originalValue !== currentValue;
    });

    if (!hasChanges) {
      console.log('Aucune modification apportée !');
      onClose();
      return;
    }

    await submitForm();
  };

  const handleSubmitButton = async () => {
    await submitForm();
  };

  const submitForm = async () => {

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
      
      // S'assurer que la date est définie
      const dataToSend = {
        ...formDataState,
        Date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      };
      
      const querySnapshot = await addDoc(evolutionCollection, dataToSend);

      console.log('Données enregistrés dans Firebase avec succès (ID:', querySnapshot.id, ')');
      
    } catch (error) {
      console.log('Erreur lors de l\'envoi des données:', error);
    }

     // Envoi par email
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: "Utilisateur BBL", 
            email: "contact@bbl-groupe.fr", 
            subject: (formDataState.type === 'new' ? "Nouvelle demande" : "Demande d'évolution"),
            message: `
            ${formDataState.Robot === 'TOUT' ? '' : " <br>Robot :" + formDataState.Robot}
            Intitulé: ${formDataState.Intitulé}
            Description: ${formDataState.Description}
            Temps consommé: ${formDataState.Temps_consommé}
            Nb. operations mensuelles: ${formDataState.Nb_operations_mensuelles}
            ${formDataState.type === 'new' ? "Date de création de la demande" : "Date de mise à jour de la demande"} : ${new Date().toLocaleString()}
            `.trim() // Supprime les espaces inutiles
            //<br>Statut: ${formData.Statut}
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
        window.location.reload(); // Recharge la page pour récupérer les nouvelles données

    } catch (error: unknown) {
      let errorData: { error: string };
      if (error instanceof Response) {
        errorData = await error.json();
      } else if (error instanceof Error) {
        errorData = { error: error.message };
      } else {
        errorData = { error: 'Échec de l\'envoi de la demande' };
      }
      console.error('!! Erreur lors de l\'envoi de mail:', errorData.error);
      toast({
        title: 'Erreur d\'envoi de mail',
        description: errorData.error || 'Échec de l\'envoi de la demande',
        variant: 'destructive',
        id: ''
      });
    }

  }

  return (
    <ClientWrapper>
      {formDataState.type === 'new' ? (
        //  Formulaire de nouvelle demande 
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle demande</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              {/* {formDataState.Robot === 'TOUT' && ( <div>Erreur ! robot: {formDataState.Robot}</div> )} */}
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
              <div>
                <Label htmlFor="Nombre d'opérations mensuelles">Nombre d'opérations mensuelles</Label>
                <Input
                  id="Nombre d'opérations mensuelles"
                  name="Nb_operations_mensuelles"
                  value={formDataState.Nb_operations_mensuelles}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="Temps consommé">Temps consommé (minutes par opération)</Label>
                <Input
                  id="Temps consommé"
                  name="Temps_consommé"
                  value={formDataState.Temps_consommé}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" className="bg-red-500 hover:bg-red-700 text-white" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-700 text-white">
                  Envoyer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ) : formDataState.type === 'edit' ? (
        // Formulaire de détail
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de {formDataState.Robot}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            {/* {formDataState && <div>typeGain: {formDataState.type_gain}</div>} */}
              <div>
                <Label htmlFor="intitulé">Intitulé</Label>
                <Input
                  id="intitulé"
                  name="Intitulé"
                  value={formDataState.Intitulé}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="Description"
                  value={formDataState.Description}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                {isEditing ? (
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
                ) : (
                  <Input
                    id="statut"
                    name="Statut"
                    value={statuts.find(s => s.numero === formDataState.Statut)?.label || formDataState.Statut}
                    disabled
                  />
                )}
              </div>
              {formDataState.type_gain  === 'temps' ? (
              <div>
                <Label htmlFor="Temps consommé">Temps consommé (minutes par opération)</Label>
                <Input
                  id="Temps consommé"
                  name="Temps_consommé"
                  value={formDataState.Temps_consommé}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              ) : (
              <div>
                <Label htmlFor="Nombre d'opérations mensuelles">Nombre d'opérations mensuelles</Label>
                <Input
                  id="Nombre d'opérations mensuelles"
                  name="Nb_operations_mensuelles"
                  value={formDataState.Nb_operations_mensuelles}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              )}  
              <div className="flex justify-end space-x-2 mt-4">
                {isEditing ? (
                  <>
                    <Button type="button"
                      className="bg-red-500 hover:bg-red-700 text-white" onClick={() => setIsEditing(false)}  >Annuler</Button>
                    <Button
                      type="button"
                      className="bg-green-500 hover:bg-green-700 text-white"
                      onClick={() => handleSubmit()}
                    >
                      Envoyer
                    </Button>
                  </>
                ) : (
                  <>
                  <Button type="button"
                      className="bg-red-500 hover:bg-red-700 text-white" onClick={onClose} >Annuler</Button>
                  <Button
                    type="button"
                    className="bg-green-500 hover:bg-green-700 text-white"
                    onClick={() => setIsEditing(true)}
                  >
                    Edition
                  </Button>
                  </>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        // // Formulaire de demande d'évolution // //
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demande d'évolution du robot {formDataState.Robot}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
            {/* {formDataState && <div>typeGain: {formDataState.type_gain}</div>} */}
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
              {formDataState.type_gain === 'temps' ? (
              <div>
              <Label htmlFor="Temps consommé">Temps consommé (minutes par opération)</Label>
              <Input
                id="Temps consommé"
                name="Temps_consommé"
                value={formDataState.Temps_consommé}
                onChange={handleChange}
              />
            </div>
              ) : (
              <div>
                <Label htmlFor="Nombre d'opérations mensuelles">Nombre d'opérations mensuelles</Label>
                <Input
                  id="Nombre d'opérations mensuelles"
                  name="Nb_operations_mensuelles"
                  value={formDataState.Nb_operations_mensuelles}
                  onChange={handleChange}
                />
              </div>
              )}  

              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" className="bg-red-500 hover:bg-red-700 text-white" onClick={onClose}>Annuler</Button>
                <Button type="submit" className="bg-green-500 hover:bg-green-700 text-white">Envoyer</Button>
              </div>

            </form>
          </DialogContent>
        </Dialog>
      )}
    </ClientWrapper>
  )
}
