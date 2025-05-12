"use client"

import { useEffect, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Sticker } from "@/lib/types"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

interface ReadOnlyMapProps {
  stickers: Sticker[]
}

export default function ReadOnlyMap({ stickers }: ReadOnlyMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fix Leaflet marker icon issue
  useEffect(() => {
    if (isClient) {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
    }
  }, [isClient])

  // Custom marker icon for stickers
  const stickerIcon = new L.Icon({
    iconUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pourprout-Z6NoBle11iBRAhnFVedbcPWS3hALeT.png",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  })

  // Calculer le centre de la carte en fonction des autocollants
  const getMapCenter = () => {
    if (stickers.length === 0) {
      return [48.8566, 2.3522] as [number, number] // Paris par défaut
    }

    // Calculer le centre des autocollants
    const sumLat = stickers.reduce((sum, sticker) => sum + sticker.latitude, 0)
    const sumLng = stickers.reduce((sum, sticker) => sum + sticker.longitude, 0)
    return [sumLat / stickers.length, sumLng / stickers.length] as [number, number]
  }

  return (
    <div className="relative">
      <MapContainer
        center={getMapCenter()}
        zoom={3}
        style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stickers.map((sticker) => (
          <Marker key={sticker.id} position={[sticker.latitude, sticker.longitude]} icon={stickerIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">{sticker.location}</h3>
                {sticker.image_url && (
                  <div className="my-2 rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={sticker.image_url || "/placeholder.svg"}
                      alt={sticker.location}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = "https://placehold.co/200x150/crottance/white?text=Image+non+disponible"
                      }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-600">Ajouté par: {sticker.addedBy}</p>
                <p className="text-sm text-gray-600">Date: {new Date(sticker.date).toLocaleDateString()}</p>
                {sticker.notes && <p className="mt-2">{sticker.notes}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
