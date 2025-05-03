"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  previewUrl?: string
}

export function ImageUpload({ onImageSelect, previewUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image")
        return
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 5MB")
        return
      }

      // Créer un aperçu
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      onImageSelect(file)

      // Nettoyer l'URL de l'objet lorsque le composant est démonté
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setPreview(null)
      onImageSelect(null)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-crottance-800">Photo (optionnel)</Label>

      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            id="image-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 flex flex-col items-center justify-center gap-2 border-crottance-200 text-crottance-700"
          >
            <Upload className="h-5 w-5" />
            <span>Ajouter une photo</span>
            <span className="text-xs text-gray-500">JPG, PNG, GIF (max 5MB)</span>
          </Button>
        </div>
      ) : (
        <div className="relative border rounded-md overflow-hidden">
          <img src={preview || "/placeholder.svg"} alt="Aperçu" className="w-full h-32 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
