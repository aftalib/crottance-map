"use client"

import { useEffect } from "react"

export default function RedirectPage() {
  useEffect(() => {
    // Rediriger vers crottance.com sans préserver le chemin
    window.location.href = "https://crottance.com"
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Crottance Map 🔥</h1>
        <p className="mb-4">Redirection vers crottance.com...</p>
        <a href="https://crottance.com" className="text-red-600 hover:underline">
          Cliquez ici si vous n'êtes pas redirigé automatiquement
        </a>
      </div>
    </div>
  )
}
