/**
 * Nettoie un nom de lieu en supprimant les préfixes entre parenthèses
 * @param name Nom du lieu à nettoyer
 * @returns Nom du lieu nettoyé
 */
export function cleanLocationName(name: string): string {
  if (!name || typeof name !== "string") return "Inconnu"

  // Supprimer les préfixes entre parenthèses
  return name.replace(/\s*$$[^)]*$$/g, "").trim()
}
