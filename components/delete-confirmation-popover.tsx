"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, AlertCircle } from "lucide-react"
import type { Sticker } from "@/lib/types"

interface DeleteConfirmationPopoverProps {
  sticker: Sticker
  onDelete: (id: string) => void
}

export function DeleteConfirmationPopover({ sticker, onDelete }: DeleteConfirmationPopoverProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Vérifier le mot de passe (le même que pour la connexion)
    if (password === "carotte") {
      onDelete(sticker.id)
      setPassword("")
      setError(false)
      setIsOpen(false)
    } else {
      setError(true)
      setTimeout(() => setError(false), 3000) // Effacer l'erreur après 3 secondes
    }

    setIsSubmitting(false)
  }

  const handleClose = () => {
    setPassword("")
    setError(false)
    setIsOpen(false)
  }

  // Utilisons une approche plus simple avec un modal inline au lieu du Popover
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-crottance-400 hover:text-crottance-600 hover:bg-crottance-50"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Supprimer</span>
      </Button>

      {isOpen && (
        <>
          {/* Overlay pour capturer les clics en dehors */}
          <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={handleClose} aria-hidden="true" />

          {/* Popup de confirmation */}
          <div
            className="absolute right-0 top-0 z-[9999] w-60 rounded-md border bg-white p-3 shadow-md"
            style={{ transform: "translateX(-10px) translateY(10px)" }}
          >
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <h4 className="font-medium text-crottance-800 text-sm">Confirmer la suppression</h4>
                <p className="text-xs text-gray-500 mt-0.5">Mot de passe requis</p>
              </div>

              <div className="space-y-1">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-crottance-500 focus:ring-crottance-500 h-8 text-sm"
                  placeholder="Mot de passe"
                  autoComplete="off"
                  required
                  autoFocus
                />

                {error && (
                  <div className="bg-crottance-50 text-crottance-800 p-1.5 rounded-md flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3 text-crottance-600" />
                    <span>Mot de passe incorrect</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="border-crottance-200 text-crottance-700 h-7 text-xs px-2"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 h-7 text-xs px-2"
                  disabled={!password || isSubmitting}
                >
                  Supprimer
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
