"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin, Search } from "lucide-react"

interface AddressResult {
  display_name: string
  lat: string
  lon: string
  place_id: number
}

interface AddressAutocompleteProps {
  onAddressSelect: (location: string, coordinates: [number, number]) => void
  placeholder?: string
  label?: string
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Rechercher une adresse...",
  label = "Adresse",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Recherche d'adresses via l'API Nominatim
  useEffect(() => {
    const searchAddress = async () => {
      if (query.length < 3) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        )
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresses:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchAddress, 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  // Fermer les résultats lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleAddressSelect = (result: AddressResult) => {
    const coordinates: [number, number] = [Number.parseFloat(result.lat), Number.parseFloat(result.lon)]
    onAddressSelect(result.display_name, coordinates)
    setQuery(result.display_name)
    setShowResults(false)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="address-search" className="text-crottance-800">
        {label}
      </Label>
      <div className="relative">
        <div className="relative">
          <Input
            id="address-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="pr-10 focus:border-crottance-500 focus:ring-crottance-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {showResults && (results.length > 0 || isLoading) && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="p-2 text-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Recherche en cours...
              </div>
            )}
            {!isLoading &&
              results.map((result) => (
                <div
                  key={result.place_id}
                  className="p-2 hover:bg-crottance-50 cursor-pointer flex items-start"
                  onClick={() => handleAddressSelect(result)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-crottance-600" />
                  <span className="text-sm">{result.display_name}</span>
                </div>
              ))}
            {!isLoading && results.length === 0 && query.length >= 3 && (
              <div className="p-2 text-center text-sm text-gray-500">Aucun résultat trouvé</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
