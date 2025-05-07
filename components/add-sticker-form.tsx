"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserSelect } from "@/components/user-select"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { ImageUpload } from "@/components/image-upload"
import { uploadStickerImage } from "@/lib/supabase"
import type { Sticker } from "@/lib/types"
import { Loader2, MapPin, Locate } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {}, [selectedLocation])

  const handleAddressSelect = (address: string, coordinates: [number, number]) => {
    setLocation(address)
    onLocationChange(coordinates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location || !addedBy || !selectedLocation) {
      return
    }

    setIsSubmitting(true)

    try {
      const [latitude, longitude] = selectedLocation

      // Télécharger l'image si elle existe
      let image_url = undefined
      if (selectedImage) {
        image_url = await uploadStickerImage(selectedImage)
      }

      const newSticker: Omit<Sticker, "id"> = {
        location,
        addedBy,
        notes,
        date: new Date().toISOString(),
        latitude,
        longitude,
        created_at: new Date().toISOString(),
        image_url,
      }

      await onAddSticker(newSticker)

      // Reset form
      setLocation("")
      setAddedBy("")
      setNotes("")
      setSelectedImage(null)
    } catch (error) {
      console.error("Error submitting sticker:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGetCurrentLocation = () => {
    setIsLocating(true)

    if (navigator.geolocation) {
      // Options de géolocalisation pour une précision maximale
      const geoOptions = {
        enableHighAccuracy: true, // Demande la meilleure précision possible
        timeout: 15000, // Temps d'attente plus long (15 secondes)
        maximumAge: 0, // Force une nouvelle lecture (pas de cache)
      }

      // Fonction de succès
      const geoSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = position.coords

        console.log(`Position obtenue avec une précision de ${accuracy} mètres`)
        console.log(`Coordonnées: ${latitude}, ${longitude}`)

        // Mettre à jour la position sur la carte
        onLocationChange([latitude, longitude])

        // Afficher un toast avec la précision et proposer l'ajustement manuel
        toast({
          title: "Position obtenue",
          description: `Précision: ${Math.round(accuracy)} mètres`,
          duration: 3000,
        })

        // Essayer d'obtenir l'adresse à partir des coordonnées avec plusieurs APIs
        const fetchAddress = async () => {
          try {
            // On récupère toujours l'adresse pour le débogage, mais on ne l'utilise plus pour remplir le champ
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "fr",
                  "User-Agent": "Crottance Map App (educational project)",
                },
              },
            )

            if (response.ok) {
              const data = await response.json()
              console.log("Adresse trouvée:", data.display_name)
            }

            // On termine simplement le chargement sans mettre à jour le champ
            setIsLocating(false)
          } catch (error) {
            console.error("Erreur lors de la récupération de l'adresse:", error)
            setIsLocating(false)
          }
        }

        fetchAddress()
      }

      // Fonction d'erreur
      const geoError = (error: GeolocationPositionError) => {
        console.error("Erreur de géolocalisation:", error)

        let errorMessage = "Impossible d'accéder à votre position."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Vous avez refusé l'accès à votre position. Veuillez vérifier les paramètres de votre navigateur."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Votre position est actuellement indisponible. Veuillez réessayer plus tard."
            break
          case error.TIMEOUT:
            errorMessage = "La demande de position a expiré. Veuillez réessayer."
            break
        }

        toast({
          title: "Erreur de localisation",
          description: errorMessage,
          variant: "destructive",
        })

        setIsLocating(false)
      }

      // Demander la position
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions)
    } else {
      toast({
        title: "Non supporté",
        description: "La géolocalisation n'est pas prise en charge par votre navigateur.",
        variant: "destructive",
      })
      setIsLocating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-crottance-800">Ajouter un autocollant</h2>

      <div className="bg-crottance-50 p-3 rounded-md mb-4 border border-crottance-100 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-crottance-600" />
        {selectedLocation ? (
          <p className="text-sm text-crottance-800">
            Position sélectionnée : {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-crottance-800">
            Recherchez une adresse ou cliquez sur la carte pour sélectionner un emplacement.
          </p>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Button
          type="button"
          onClick={handleGetCurrentLocation}
          className="bg-crottance-600 hover:bg-crottance-700 flex items-center"
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Localisation...
            </>
          ) : (
            <>
              <Locate className="h-4 w-4 mr-1" />
              Utiliser ma position
            </>
          )}
        </Button>
      </div>

      <AddressAutocomplete
        onAddressSelect={handleAddressSelect}
        label="Rechercher un lieu"
        placeholder="ex. Rue Alsace Lorraine, Toulouse"
      />

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

      <ImageUpload onImageSelect={setSelectedImage} />

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
          disabled={!location || !addedBy || !selectedLocation || isSubmitting}
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
