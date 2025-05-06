"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import dynamic from "next/dynamic"
import AddStickerForm from "@/components/add-sticker-form"
import StickerList from "@/components/sticker-list"
import LoginPage from "@/components/login-page"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { fetchStickers, addSticker, deleteSticker } from "@/lib/supabase"
import type { Sticker } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Import the map component dynamically to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <p>Loading map...</p>
    </div>
  ),
})

// Composant principal protégé par authentification
function MainApp() {
  const { isAuthenticated, logout } = useAuth()
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [focusedSticker, setFocusedSticker] = useState<Sticker | null>(null)

  // Charger les autocollants depuis Supabase
  const loadStickers = async () => {
    if (isAuthenticated) {
      setIsLoading(true)
      try {
        const data = await fetchStickers()
        setStickers(data)
      } catch (error) {
        console.error("Error loading stickers:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les autocollants",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Charger les autocollants au chargement et quand l'authentification change
  useEffect(() => {
    if (isAuthenticated) {
      loadStickers()
    }
  }, [isAuthenticated])

  // Rafraîchir les autocollants périodiquement (toutes les 30 secondes)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      loadStickers()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleAddSticker = async (stickerData: Omit<Sticker, "id">) => {
    try {
      const newSticker = await addSticker(stickerData)
      if (newSticker) {
        setStickers([newSticker, ...stickers])
        setShowForm(false)
        setSelectedLocation(null)
        toast({
          title: "Succès",
          description: "Autocollant ajouté avec succès",
        })
      }
    } catch (error) {
      console.error("Error adding sticker:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'autocollant",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSticker = async (id: string) => {
    try {
      const success = await deleteSticker(id)
      if (success) {
        setStickers(stickers.filter((sticker) => sticker.id !== id))
        // Si l'autocollant supprimé était celui qui était focus, on retire le focus
        if (focusedSticker && focusedSticker.id === id) {
          setFocusedSticker(null)
        }
        toast({
          title: "Succès",
          description: "Autocollant supprimé avec succès",
        })
      }
    } catch (error) {
      console.error("Error deleting sticker:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'autocollant",
        variant: "destructive",
      })
    }
  }

  const handleMapClick = (latlng: [number, number]) => {
    setSelectedLocation(latlng)
    setShowForm(true)
  }

  const handleStickerSelect = (sticker: Sticker) => {
    setFocusedSticker(sticker)
    // Notification toast supprimée comme demandé
  }

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="crottance-header rounded-lg p-6 mb-6 text-center shadow-lg relative">
        <h1 className="text-3xl font-bold">Crottance Map 🔥</h1>
        <p className="mt-2 text-crottance-100">Peteurs worldwide 🌏</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="absolute top-2 right-2 text-white hover:bg-crottance-700"
        >
          Déconnexion
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 crottance-card">
          <CardContent className="p-4">
            <MapComponent
              stickers={stickers}
              onMapClick={handleMapClick}
              selectedLocation={selectedLocation}
              focusedSticker={focusedSticker}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="crottance-card">
            <CardContent className="p-4">
              {showForm ? (
                <AddStickerForm
                  onAddSticker={handleAddSticker}
                  selectedLocation={selectedLocation}
                  onCancel={() => {
                    setShowForm(false)
                    setSelectedLocation(null)
                  }}
                  onLocationChange={setSelectedLocation}
                />
              ) : (
                <div className="text-center">
                  <p className="mb-4">Cliquez sur la carte pour ajouter un nouvel autocollant.</p>
                  <Button
                    className="bg-crottance-600 hover:bg-crottance-700"
                    onClick={() => {
                      setShowForm(true)
                    }}
                    disabled={!selectedLocation}
                  >
                    Ajouter un autocollant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="crottance-card">
            <CardContent className="p-4">
              <StickerList
                stickers={stickers}
                onDelete={handleDeleteSticker}
                onStickerSelect={handleStickerSelect}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </main>
  )
}

// Wrapper avec le provider d'authentification
export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
