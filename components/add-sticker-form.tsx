"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserSelect } from "@/components/user-select"
import type { Sticker } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface AddStickerFormProps {
  onAddSticker: (sticker: Omit<Sticker, "id">) => void
  selectedLocation: [number, number] | null
  onCancel: () => void
  onLocationChange: (location: [number, number]) => void
}

export default function AddStickerForm({
  onAddSticker,
  selectedLocation,
  onCancel,
  onLocationChange,
}: AddStickerFormProps) {
  const [location, setLocation] = useState("")
  const [addedBy, setAddedBy] = useState("")
  const [notes, setNotes] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation[0].toString())
      setLongitude(selectedLocation[1].toString())
    }
  }, [selectedLocation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location || !addedBy || !latitude || !longitude) return

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      alert("Veuillez entrer des coordonnées valides")
      return
    }

    setIsSubmitting(true)

    const newSticker: Omit<Sticker, "id"> = {
      location,
      addedBy,
      notes,
      date: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
      created_at: new Date().toISOString(),
    }

    try {
      await onAddSticker(newSticker)

      // Reset form
      setLocation("")
      setAddedBy("")
      setNotes("")
      setLatitude("")
      setLongitude("")
    } catch (error) {
      console.error("Error submitting sticker:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle manual coordinate updates
  const handleCoordinateChange = () => {
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationChange([lat, lng])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-crottance-800">Ajouter un autocollant</h2>

      <div className="bg-crottance-50 p-3 rounded-md mb-4 border border-crottance-100">
        <p className="text-sm text-crottance-800">
          Cliquez sur la carte pour sélectionner un emplacement ou entrez les coordonnées manuellement.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-crottance-800">
            Latitude
          </Label>
          <Input
            id="latitude"
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            onBlur={handleCoordinateChange}
            placeholder="ex. 48.8566"
            className="focus:border-crottance-500 focus:ring-crottance-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-crottance-800">
            Longitude
          </Label>
          <Input
            id="longitude"
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            onBlur={handleCoordinateChange}
            placeholder="ex. 2.3522"
            className="focus:border-crottance-500 focus:ring-crottance-500"
            required
          />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-crottance-200 text-crottance-700 hover:bg-crottance-50"
        onClick={handleCoordinateChange}
      >
        Mettre à jour la position
      </Button>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-crottance-800">
          Nom du lieu
        </Label>
        <Input
          id="location"
          placeholder="ex. Parc des Buttes-Chaumont, Paris"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="focus:border-crottance-500 focus:ring-crottance-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addedBy" className="text-crottance-800">
          Ajouté par
        </Label>
        <UserSelect value={addedBy} onChange={setAddedBy} placeholder="Sélectionner un utilisateur..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-crottance-800">
          Notes (Optionnel)
        </Label>
        <Textarea
          id="notes"
          placeholder="Détails supplémentaires sur cet autocollant..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="focus:border-crottance-500 focus:ring-crottance-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          className="border-crottance-200 text-crottance-700 hover:bg-crottance-50"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-crottance-600 hover:bg-crottance-700"
          disabled={!location || !addedBy || !latitude || !longitude || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ajout en cours...
            </>
          ) : (
            "Ajouter l'autocollant"
          )}
        </Button>
      </div>
    </form>
  )
}
