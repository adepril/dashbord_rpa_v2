'use client';

import * as React from 'react';

const TOAST_LIMIT = 1; // Limite du nombre de toasts affichés
const TOAST_REMOVE_DELAY = 1000000; // Délai avant la suppression d'un toast

interface ToasterToast {
  id: string;
  title: string;
  description?: string;
  variant?: string; // Optionnel pour le style
}

let toastId = 0; // Compteur pour générer des IDs uniques

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

let memoryState = { toasts: [] as ToasterToast[] }; // État initial

const addToast = (toast: ToasterToast) => {
  const id = (toastId++).toString();
  memoryState.toasts.push({ ...toast, id });
  // Supprimer le toast après un certain délai
  const timeout = setTimeout(() => {
    memoryState.toasts = memoryState.toasts.filter(t => t.id !== id);
    dispatch({ type: 'REMOVE_TOAST', toastId: id });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(id, timeout);
};

function dispatch(action: { type: string; toastId?: string }) {
  switch (action.type) {
    case 'REMOVE_TOAST':
      memoryState.toasts = memoryState.toasts.filter(t => t.id !== action.toastId);
      break;
    default:
      break;
  }
}

interface UseToastReturn {
  toasts: ToasterToast[];
  toast: (toast: ToasterToast) => void;
}

function useToast(): UseToastReturn {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    const listener = () => setState(memoryState);
    const unsubscribe = () => {
      // Nettoyage si nécessaire
    };
    return () => unsubscribe();
  }, [state]);

  return {
    toasts: state.toasts,
    toast: addToast, // Ajout de la fonction toast
  };
}

export { useToast };
