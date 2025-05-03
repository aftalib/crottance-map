"use client"

import { useEffect, useState, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Sticker } from "@/lib/types"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"

interface MapComponentProps {
  stickers: Sticker[]
  onMapClick: (latlng: [number, number]) => void
  selectedLocation: [number, number] | null
}

// Component to handle selected location marker and map centering
function LocationMarker({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(position, map.getZoom() < 12 ? 12 : map.getZoom())
  }, [map, position])

  return (
    <Marker
      position={position}
      icon={
        new L.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      }
    >
      <Popup>Nouvel emplacement</Popup>
    </Marker>
  )
}

// Component to handle map clicks with improved click detection
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: [number, number]) => void }) {
  const isDragging = useRef(false)
  const startPoint = useRef<[number, number] | null>(null)
  const threshold = 5 // pixels threshold to determine if it's a drag or click

  const map = useMapEvents({
    mousedown: (e) => {
      // Vérifier si le clic est sur un marqueur
      const target = e.originalEvent.target as HTMLElement
      if (
        target.classList.contains("leaflet-marker-icon") ||
        target.closest(".leaflet-popup") ||
        target.closest(".leaflet-popup-pane")
      ) {
        // Si c'est un clic sur un marqueur ou un popup, ne rien faire
        return
      }

      startPoint.current = [e.originalEvent.clientX, e.originalEvent.clientY]
      isDragging.current = false
    },
    mousemove: (e) => {
      if (!startPoint.current) return

      const dx = Math.abs(e.originalEvent.clientX - startPoint.current[0])
      const dy = Math.abs(e.originalEvent.clientY - startPoint.current[1])

      // If moved more than threshold, consider it a drag
      if (dx > threshold || dy > threshold) {
        isDragging.current = true
      }
    },
    mouseup: (e) => {
      // Vérifier si le clic est sur un marqueur
      const target = e.originalEvent.target as HTMLElement
      if (
        target.classList.contains("leaflet-marker-icon") ||
        target.closest(".leaflet-popup") ||
        target.closest(".leaflet-popup-pane")
      ) {
        // Si c'est un clic sur un marqueur ou un popup, ne rien faire
        startPoint.current = null
        return
      }

      if (!isDragging.current && startPoint.current) {
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
      startPoint.current = null
    },
    // Handle touch events for mobile
    touchstart: (e) => {
      // Vérifier si le toucher est sur un marqueur
      const target = e.originalEvent.target as HTMLElement
      if (
        target.classList.contains("leaflet-marker-icon") ||
        target.closest(".leaflet-popup") ||
        target.closest(".leaflet-popup-pane")
      ) {
        // Si c'est un toucher sur un marqueur ou un popup, ne rien faire
        return
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        startPoint.current = [touch.clientX, touch.clientY]
        isDragging.current = false
      }
    },
    touchmove: (e) => {
      if (!startPoint.current || e.touches.length !== 1) return

      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - startPoint.current[0])
      const dy = Math.abs(touch.clientY - startPoint.current[1])

      if (dx > threshold || dy > threshold) {
        isDragging.current = true
      }
    },
    touchend: (e) => {
      // Vérifier si le toucher est sur un marqueur
      const target = e.originalEvent.target as HTMLElement
      if (
        target.classList.contains("leaflet-marker-icon") ||
        target.closest(".leaflet-popup") ||
        target.closest(".leaflet-popup-pane")
      ) {
        // Si c'est un toucher sur un marqueur ou un popup, ne rien faire
        startPoint.current = null
        return
      }

      if (!isDragging.current && startPoint.current) {
        // For touch events, we need to get the latlng differently
        const map = e.target
        const point = map.mouseEventToLatLng(e.originalEvent)
        onMapClick([point.lat, point.lng])
      }
      startPoint.current = null
    },
  })

  return null
}

export default function MapComponent({ stickers, onMapClick, selectedLocation }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef(null)

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

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 px-3 py-1 rounded-md text-sm text-crottance-800 border border-crottance-200">
        <p>Cliquez pour placer un autocollant</p>
      </div>

      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={4}
        style={{ height: "500px", width: "100%" }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />

        {selectedLocation && <LocationMarker position={selectedLocation} />}

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
                        // Fallback en cas d'erreur de chargement de l'image
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
