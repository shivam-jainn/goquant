"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { ListCoins } from "@/lib/controllers/binance"

export function AssetList() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const { data, isLoading, isError, error } = useQuery({
    queryFn: async () => await ListCoins(),
    queryKey: ["assets"],
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? value
            : "Select asset..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search asset..." />
          {isLoading && <div className="p-2">Loading...</div>}
          {isError && <div className="p-2 text-red-500">{error?.message || "Failed to load data"}</div>}
          {!isLoading && !isError && (
            <CommandList>
              <CommandEmpty>No asset found.</CommandEmpty>
              <CommandGroup>
              {data?.map((coin) => (
  <CommandItem
    key={coin}
    value={coin}
    onSelect={(currentValue) => {
      setValue(currentValue === value ? "" : currentValue)
      setOpen(false)
    }}
  >
    <Check
      className={cn(
        "mr-2 h-4 w-4",
        value === coin ? "opacity-100" : "opacity-0"
      )}
    />
    {coin}
  </CommandItem>
))}

              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
