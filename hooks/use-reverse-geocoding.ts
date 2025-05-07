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
const MAX_CONCURRENT_REQUESTS = 1 // Réduit à 1 pour éviter les erreurs 400

// Fonction pour nettoyer les préfixes entre parenthèses
function cleanLocationName(name: string): string {
  if (!name || typeof name !== "string") return "Inconnu"

  // Supprimer les préfixes entre parenthèses
  return name.replace(/\s*$$[^)]*$$/g, "").trim()
}

// Liste des APIs de géocodage à essayer
const geocodingApis = [
  {
    name: "BigDataCloud",
    url: (lat: number, lon: number) =>
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,
    extract: (data: any) => {
      const city = data.city || data.locality || data.principalSubdivision || "Inconnu"
      const country = data.countryName || "Inconnu"
      return { city, country }
    },
  },
  {
    name: "Geocode.maps.co",
    url: (lat: number, lon: number) => `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&format=json`,
    extract: (data: any) => {
      const city =
        data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Inconnu"
      const country = data.address?.country || "Inconnu"
      return { city, country }
    },
  },
  {
    name: "LocationIQ",
    url: (lat: number, lon: number) =>
      `https://eu1.locationiq.com/v1/reverse.php?key=pk.2f8d10f5680a8c4c8c7f6a75b0c30b0c&lat=${lat}&lon=${lon}&format=json`,
    extract: (data: any) => {
      const city =
        data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Inconnu"
      const country = data.address?.country || "Inconnu"
      return { city, country }
    },
  },
]

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

    // Fonction pour essayer les APIs de géocodage une par une
    const tryGeocodingApis = async (apiIndex = 0) => {
      if (apiIndex >= geocodingApis.length) {
        setResult({
          city: "Localisation",
          country: "non disponible",
          loading: false,
          error: true,
        })
        return
      }

      if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
        // Si trop de requêtes sont en cours, réessayer plus tard
        setTimeout(() => tryGeocodingApis(apiIndex), 2000 + Math.random() * 2000)
        return
      }

      pendingRequests++
      const api = geocodingApis[apiIndex]

      try {
        console.log(`Essai de l'API ${api.name} pour ${latitude}, ${longitude}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // Timeout après 5 secondes

        const response = await fetch(api.url(latitude, longitude), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "Crottance Map App (educational project)",
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.warn(`API ${api.name} a répondu avec ${response.status}: ${response.statusText}`)
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        // Extraire la ville et le pays
        const { city, country } = api.extract(data)

        // Nettoyer les noms
        const cleanedCity = cleanLocationName(city)
        const cleanedCountry = cleanLocationName(country)

        // Mettre en cache le résultat
        const locationResult = { city: cleanedCity, country: cleanedCountry }
        geocodingCache.set(cacheKey, locationResult)

        setResult({
          ...locationResult,
          loading: false,
          error: false,
        })
      } catch (error) {
        console.error(`Erreur avec l'API ${api.name}:`, error)

        // Essayer l'API suivante après un délai
        setTimeout(() => tryGeocodingApis(apiIndex + 1), 1000)
      } finally {
        pendingRequests--
      }
    }

    // Ajouter un délai pour éviter de surcharger l'API
    const timeoutId = setTimeout(
      () => {
        tryGeocodingApis()
      },
      1000 + Math.random() * 2000,
    ) // Délai entre 1s et 3s

    return () => clearTimeout(timeoutId)
  }, [latitude, longitude])

  return result
}
