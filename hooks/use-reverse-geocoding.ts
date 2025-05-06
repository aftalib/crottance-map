"use client"

import { useState, useEffect } from "react"

interface GeocodingResult {
  city: string
  country: string
  loading: boolean
  error: boolean
}

// Cache pour éviter de refaire les mêmes requêtes
const geocodingCache = new Map<string, { city: string; country: string }>()

// Compteur global pour limiter les requêtes simultanées
let pendingRequests = 0
const MAX_CONCURRENT_REQUESTS = 2

// Fonction pour nettoyer les préfixes entre parenthèses
function cleanLocationName(name: string): string {
  if (!name) return "Inconnu"

  // Supprimer les préfixes comme (le), (la), (les), etc.
  // Utilisation d'une expression régulière corrigée et testée
  return name.replace(/\s*$$[^$$]*\)/g, "").trim()
}

export function useReverseGeocoding(latitude: number, longitude: number): GeocodingResult {
  const [result, setResult] = useState<GeocodingResult>({
    city: "",
    country: "",
    loading: true,
    error: false,
  })

  useEffect(() => {
    // Vérifier si les coordonnées sont valides
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setResult({
        city: "Coordonnées invalides",
        country: "",
        loading: false,
        error: true,
      })
      return
    }

    // Forcer le nettoyage du cache pour les tests
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`

    // Vérifier si nous avons déjà ces coordonnées en cache
    if (geocodingCache.has(cacheKey)) {
      const cachedResult = geocodingCache.get(cacheKey)!
      setResult({
        ...cachedResult,
        loading: false,
        error: false,
      })
      return
    }

    // Fonction pour faire la requête de géocodage
    const fetchLocation = async () => {
      if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
        // Si trop de requêtes sont en cours, réessayer plus tard
        setTimeout(fetchLocation, 1000 + Math.random() * 1000)
        return
      }

      pendingRequests++
      try {
        // Utiliser l'API BigDataCloud qui est plus permissive avec CORS
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`,
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        // Extraire la ville et le pays et nettoyer les préfixes
        let city = data.city || data.locality || data.principalSubdivision || "Inconnu"
        city = cleanLocationName(city)

        let country = data.countryName || "Inconnu"
        country = cleanLocationName(country)

        console.log("Localisation nettoyée:", { original: data.city || data.locality, cleaned: city })

        // Mettre en cache le résultat
        const locationResult = { city, country }
        geocodingCache.set(cacheKey, locationResult)

        setResult({
          ...locationResult,
          loading: false,
          error: false,
        })
      } catch (error) {
        console.error("Erreur de géocodage inverse:", error)

        // Essayer avec une API alternative en cas d'échec
        try {
          const fallbackResponse = await fetch(
            `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          )

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()

            let city =
              fallbackData.address?.city ||
              fallbackData.address?.town ||
              fallbackData.address?.village ||
              fallbackData.address?.county ||
              "Inconnu"
            city = cleanLocationName(city)

            let country = fallbackData.address?.country || "Inconnu"
            country = cleanLocationName(country)

            console.log("Localisation nettoyée (fallback):", {
              original: fallbackData.address?.city || fallbackData.address?.town,
              cleaned: city,
            })

            const locationResult = { city, country }
            geocodingCache.set(cacheKey, locationResult)

            setResult({
              ...locationResult,
              loading: false,
              error: false,
            })
          } else {
            throw new Error("Échec de l'API de secours")
          }
        } catch (fallbackError) {
          console.error("Échec de l'API de secours:", fallbackError)
          setResult({
            city: "Localisation",
            country: "non disponible",
            loading: false,
            error: true,
          })
        }
      } finally {
        pendingRequests--
      }
    }

    // Ajouter un délai pour éviter de surcharger l'API
    const timeoutId = setTimeout(
      () => {
        fetchLocation()
      },
      500 + Math.random() * 1000,
    ) // Délai entre 500ms et 1500ms

    return () => clearTimeout(timeoutId)
  }, [latitude, longitude])

  return result
}
