"use client"
import type { Sticker } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { DeleteConfirmationPopover } from "@/components/delete-confirmation-popover"

interface StickerListProps {
  stickers: Sticker[]
  onDelete: (id: string) => void
  isLoading?: boolean
}

export default function StickerList({ stickers, onDelete, isLoading = false }: StickerListProps) {
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
            className="p-3 border border-crottance-200 rounded-md flex justify-between items-start hover:bg-crottance-50 transition-colors"
          >
            <div>
              <h3 className="font-medium text-crottance-800">{sticker.location}</h3>
              <p className="text-sm text-crottance-600">
                Ajouté par {sticker.addedBy} le {new Date(sticker.date).toLocaleDateString()}
              </p>
              {sticker.notes && <p className="text-sm mt-1 text-crottance-700">{sticker.notes}</p>}
            </div>
            <DeleteConfirmationPopover sticker={sticker} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  )
}
