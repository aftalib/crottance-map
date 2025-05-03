import { createClient } from "@supabase/supabase-js"
import type { Sticker } from "./types"

// Ces variables d'environnement devront être configurées
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonctions pour interagir avec la base de données
export async function fetchStickers(): Promise<Sticker[]> {
  try {
    const { data, error } = await supabase.from("stickers").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching stickers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching stickers:", error)
    return []
  }
}

export async function addSticker(sticker: Omit<Sticker, "id">): Promise<Sticker | null> {
  try {
    const { data, error } = await supabase.from("stickers").insert([sticker]).select()

    if (error) {
      console.error("Error adding sticker:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error adding sticker:", error)
    return null
  }
}

export async function deleteSticker(id: string): Promise<boolean> {
  try {
    // Récupérer d'abord le sticker pour obtenir l'URL de l'image
    const { data: sticker } = await supabase.from("stickers").select("image_url").eq("id", id).single()

    // Si le sticker a une image, la supprimer du bucket
    if (sticker?.image_url) {
      const imagePath = sticker.image_url.split("/").pop()
      if (imagePath) {
        await supabase.storage.from("sticker-images").remove([imagePath])
      }
    }

    // Supprimer le sticker de la base de données
    const { error } = await supabase.from("stickers").delete().eq("id", id)

    if (error) {
      console.error("Error deleting sticker:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting sticker:", error)
    return false
  }
}

// Fonction pour télécharger une image vers Supabase Storage
export async function uploadStickerImage(file: File): Promise<string | null> {
  try {
    // Générer un nom de fichier unique
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

    // Télécharger le fichier
    const { data, error } = await supabase.storage.from("sticker-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading image:", error)
      return null
    }

    // Obtenir l'URL publique de l'image
    const {
      data: { publicUrl },
    } = supabase.storage.from("sticker-images").getPublicUrl(data.path)

    console.log("Image uploaded successfully, public URL:", publicUrl)
    return publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}
