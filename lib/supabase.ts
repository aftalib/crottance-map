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
