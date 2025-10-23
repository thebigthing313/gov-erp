import { useEffect, useRef, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Check, ChevronsDown } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { cn } from '@/lib/utils'

interface ComboBoxProps {
  height?: number
  placeholder?: string
  noValueMessage?: string
  emptyMessage?: string
  items?: Array<{ value: string; label: string }>
  value?: string // Controlled value
  onChange?: (value: string) => void // Callback for changes
}

export function ComboBox({
  height = 36, // Default height
  noValueMessage = 'Select an option',
  emptyMessage = 'No results found.',
  placeholder,
  items = [],
  value = '', // Default to empty string
  onChange, // Handler for value changes
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (buttonRef.current) {
      setPopoverWidth(buttonRef.current.offsetWidth)
    }
  }, [])

  // Removed internal value state; now using prop

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : noValueMessage}
          <ChevronsDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: popoverWidth }} className="p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            className={`h-[${height}px]`}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? '' : currentValue
                    onChange && onChange(newValue) // Call onChange
                    setIsOpen(false)
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === item.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
