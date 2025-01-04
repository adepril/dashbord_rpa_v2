'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import NewRequestForm from './NewRequestForm'

export default function NewRequestButton() {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      
      <Button variant="default" className="bg-[#000] text-white" onClick={() => setShowForm(true)}>Nouvelle demande</Button>
      {showForm && <NewRequestForm onClose={() => setShowForm(false)} type="new" />}
    </>
  )
}
