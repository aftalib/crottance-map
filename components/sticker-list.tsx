"use client"

import { useEffect } from "react"
import type { Sticker } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { DeleteConfirmationPopover } from "@/components/delete-confirmation-popover"
import { LocationInfo } from "@/components/location-info"

interface StickerListProps {
  stickers: Sticker[]
  onDelete: (id: string) => void
  onStickerSelect: (sticker: Sticker) => void
  isLoading?: boolean
}

export default function StickerList({ stickers, onDelete, onStickerSelect, isLoading = false }: StickerListProps) {
  // Précharger les coordonnées pour les 5 premiers autocollants
  useEffect(() => {
    if (stickers.length > 0) {
      // Précharger les coordonnées pour les 5 premiers autocollants
      const preloadStickers = stickers.slice(0, 5)
      preloadStickers.forEach((sticker) => {
        // Créer des éléments image pour précharger les coordonnées
        // Cette technique permet de contourner certaines limitations CORS
        const img = new Image()
        img.src = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${sticker.latitude}&longitude=${sticker.longitude}&localityLanguage=fr&size=1x1`
      })
    }
  }, [stickers])

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-crottance-600" />
        <p className="mt-2 text-gray-500">Chargement des autocollants...</p>
      </div>
    )
  }

  if (stickers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">
          Aucun autocollant ajouté pour le moment. Cliquez sur la carte pour ajouter votre premier autocollant !
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-crottance-800">Autocollants ({stickers.length})</h2>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className="p-3 border border-crottance-200 rounded-md flex flex-col justify-between hover:bg-crottance-50 transition-colors cursor-pointer"
            onClick={() => onStickerSelect(sticker)}
            aria-label={`Voir l'autocollant ${sticker.location} sur la carte`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onStickerSelect(sticker)
              }
            }}
          >
            <div className="flex justify-between w-full">
              <div className="flex-grow">
                <h3 className="font-medium text-crottance-800">{sticker.location}</h3>
                <LocationInfo latitude={sticker.latitude} longitude={sticker.longitude} />
                <p className="text-sm text-crottance-600 mt-1">
                  Ajouté par {sticker.addedBy} le {new Date(sticker.date).toLocaleDateString()}
                </p>
                {sticker.notes && <p className="text-sm mt-1 text-crottance-700">{sticker.notes}</p>}
              </div>
              {/* Empêcher la propagation du clic pour le bouton de suppression */}
              <div onClick={(e) => e.stopPropagation()} className="ml-2">
                <DeleteConfirmationPopover sticker={sticker} onDelete={onDelete} />
              </div>
            </div>

            {/* Affichage de l'image si disponible */}
            {sticker.image_url && (
              <div className="mt-3 rounded-md overflow-hidden border border-crottance-200">
                <img
                  src={sticker.image_url || "/placeholder.svg"}
                  alt={`Photo de ${sticker.location}`}
                  className="w-full h-auto max-h-48 object-cover"
                  onError={(e) => {
                    // Fallback en cas d'erreur de chargement de l'image
                    const target = e.target as HTMLImageElement
                    target.onerror = null

                    // Remplacer l'image par un div avec une icône
                    const parent = target.parentElement
                    if (parent) {
                      const fallbackDiv = document.createElement("div")
                      fallbackDiv.className = "w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400"

                      // Créer un span pour l'icône et le texte
                      const content = document.createElement("span")
                      content.className = "flex flex-col items-center"
                      content.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mb-2">
                          <line x1="2" y1="2" x2="22" y2="22"></line>
                          <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path>
                          <line x1="13.5" y1="13.5" x2="6" y2="21"></line>
                          <rect x="2" y="2" width="20" height="20" rx="5"></rect>
                        </svg>
                        <span class="text-xs">Image non disponible</span>
                      `

                      fallbackDiv.appendChild(content)
                      parent.replaceChild(fallbackDiv, target)
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
