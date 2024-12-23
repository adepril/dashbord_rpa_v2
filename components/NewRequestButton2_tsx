'use client'

import { useState } from 'react'
import { Button } from "./ui/button"
import NouvelleDemandeForm from './NouvelleDemandeForm'

export default function NewRequestButton2() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <Button variant="default" className="bg-[#000] text-white" onClick={() => setShowForm(true)}>
        Nouvelle Demande 2
      </Button>
      {showForm && <NouvelleDemandeForm onClose={() => setShowForm(false)} />}
    </>
  )
}
