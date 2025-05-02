"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

interface UserComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function UserCombobox({ value, onChange }: UserComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-crottance-200 focus:ring-crottance-500 focus:border-crottance-500"
        >
          {value ? value : "Sélectionner un utilisateur..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Rechercher un utilisateur..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {users.map((user) => (
                <CommandItem
                  key={user}
                  value={user}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-crottance-50"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === user ? "opacity-100 text-crottance-600" : "opacity-0")}
                  />
                  {user}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
