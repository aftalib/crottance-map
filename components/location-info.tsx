"use client"

import { useReverseGeocoding } from "@/hooks/use-reverse-geocoding"
import { MapPin, Loader2 } from "lucide-react"
import { cleanLocationName } from "@/utils/location-utils"

interface LocationInfoProps {
  latitude: number
  longitude: number
}

export function LocationInfo({ latitude, longitude }: LocationInfoProps) {
  const { city, country, loading, error } = useReverseGeocoding(latitude, longitude)

  // Nettoyer les noms de lieux une fois de plus pour s'assurer qu'ils sont propres
  const cleanedCity = cleanLocationName(city)
  const cleanedCountry = cleanLocationName(country)

  if (loading) {
    return (
      <p className="text-sm text-crottance-600 flex items-center mt-1">
        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        <span>Chargement...</span>
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-crottance-600 flex items-center mt-1">
        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
        <span>
          {cleanedCity} {cleanedCountry}
        </span>
      </p>
    )
  }

  return (
    <p className="text-sm text-crottance-600 flex items-center mt-1">
      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
      <span>
        {cleanedCity}, {cleanedCountry}
      </span>
    </p>
  )
}
