"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Vérifier si l'utilisateur est déjà authentifié au chargement
  useEffect(() => {
    const authStatus = localStorage.getItem("crottance_auth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  // Fonction de connexion
  const login = (password: string): boolean => {
    if (password === "carotte") {
      setIsAuthenticated(true)
      localStorage.setItem("crottance_auth", "authenticated")
      return true
    }
    return false
  }

  // Fonction de déconnexion
  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("crottance_auth")
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
