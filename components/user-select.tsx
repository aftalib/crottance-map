"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Liste des utilisateurs fournie
const users = [
  "ChaussetteDeCaca31",
  "Mitraillette2Chiasse",
  "Cacarante",
  "Taupe Qui Bourre",
  "Kakadhafi",
  "LeBecanneurFou2027",
  "Prepucito",
  "LavaboDeCaca",
  "krottemania",
  "Champignon Zizi",
  "crotinette freestyle",
  "Baltrou-Chocolat",
]

interface UserSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function UserSelect({ value, onChange, placeholder = "Sélectionner un utilisateur..." }: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(users)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) => user.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredUsers(filtered)
    }
  }, [searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle selection
  const handleSelect = (user: string) => {
    onChange(user)
    setSearchTerm("")
    setIsOpen(false)
  }

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchTerm("")
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input field / trigger */}
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer",
          "border-crottance-200 focus:border-crottance-500 focus:ring-crottance-500",
          isOpen && "border-crottance-500 ring-1 ring-crottance-500",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <div className="flex items-center justify-between w-full">
            <span>{value}</span>
            <button type="button" onClick={handleClear} className="p-1 rounded-full hover:bg-crottance-100">
              <X className="w-4 h-4 text-crottance-600" />
            </button>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        {!value && (isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg border-crottance-200">
          {/* Search input */}
          <div className="p-2 border-b border-crottance-100">
            <input
              type="text"
              className="w-full px-2 py-1 border rounded border-crottance-200 focus:border-crottance-500 focus:ring-crottance-500 focus:outline-none"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* User list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">Aucun utilisateur trouvé</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user}
                  className={cn(
                    "px-3 py-2 cursor-pointer flex items-center",
                    "hover:bg-crottance-50",
                    value === user && "bg-crottance-50",
                  )}
                  onClick={() => handleSelect(user)}
                >
                  <div className="w-4 mr-2">{value === user && <Check className="w-4 h-4 text-crottance-600" />}</div>
                  <span>{user}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
