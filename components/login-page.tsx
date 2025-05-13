"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { fetchPublicStickers, getStickersCount } from "@/lib/supabase"
import type { Sticker } from "@/lib/types"
import dynamic from "next/dynamic"

// Import dynamique pour éviter les problèmes de SSR avec Leaflet
const ReadOnlyMap = dynamic(() => import("@/components/read-only-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <Loader2 className="h-8 w-8 animate-spin text-crottance-600" />
      <span className="ml-2">Chargement de la carte...</span>
    </div>
  ),
})

export default function LoginPage() {
  const { login } = useAuth()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [stickerCount, setStickerCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Charger les autocollants pour la carte
        const stickersData = await fetchPublicStickers()
        setStickers(stickersData)

        // Obtenir le nombre total d'autocollants
        const count = await getStickersCount()
        setStickerCount(count)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (!success) {
      setError(true)
      setTimeout(() => setError(false), 3000) // Effacer l'erreur après 3 secondes
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-4xl">
        <div className="crottance-header rounded-lg p-6 mb-6 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Crottance Map 🔥</h1>
          <p className="mt-2 text-crottance-100">Peteurs worldwide 🌏</p>
        </div>

        {/* Compteur d'autocollants et carte */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-center mb-4 text-crottance-800">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Chargement...</span>
              </div>
            ) : (
              <>Nombre de localisations stickées par la crottance : {stickerCount} 🔥</>
            )}
          </h2>
          <div className="rounded-lg overflow-hidden shadow-md">
            {stickers.length > 0 ? (
              <ReadOnlyMap stickers={stickers} />
            ) : (
              <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md">
                {isLoading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-crottance-600" />
                    <span className="ml-2">Chargement de la carte...</span>
                  </>
                ) : (
                  <p className="text-gray-500">Aucun autocollant trouvé</p>
                )}
              </div>
            )}
          </div>
          {stickers.length > 0 && (
            <p className="text-sm text-center mt-2 text-gray-500">
              
            </p>
          )}
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center text-crottance-800">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-crottance-800">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus:border-crottance-500 focus:ring-crottance-500"
                placeholder="Entrez le mot de passe"
                required
              />
            </div>

            {error && (
              <div className="bg-crottance-50 text-crottance-800 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-crottance-600" />
                <span>Mot de passe incorrect</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-crottance-600 hover:bg-crottance-700">
              Accéder à l'espace crotteur
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
