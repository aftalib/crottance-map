"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (!success) {
      setError(true)
      setTimeout(() => setError(false), 3000) // Effacer l'erreur après 3 secondes
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="crottance-header rounded-lg p-6 mb-6 text-center shadow-lg">
          <h1 className="text-3xl font-bold">Crottance Map 🔥</h1>
          <p className="mt-2 text-crottance-100">Peteurs worldwide 🌏</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
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
              Accéder à la carte
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
