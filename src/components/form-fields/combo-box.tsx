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

/**
 * Props for the ComboBox component.
 */
interface ComboBoxProps {
  /** Optional height for the command input in pixels. Defaults to 36. */
  height?: number
  /** Placeholder text for the command input. */
  placeholder?: string
  /** Message displayed when no value is selected. Defaults to 'Select an option'. */
  noValueMessage?: string
  /** Message displayed when no search results are found. Defaults to 'No results found.'. */
  emptyMessage?: string
  /** Array of items to display in the dropdown, each with a value and label. */
  items?: Array<{ value: string; label: string }>
  /** The controlled value of the selected item. */
  value?: string
  /** Callback fired when the selection changes. */
  onChange?: (value: string) => void
}

/**
 * A controlled ComboBox component that allows selecting from a list of items.
 * The component dynamically sizes to its parent container and displays the selected item's label.
 */
export function ComboBox({
  height = 36,
  noValueMessage = 'Select an option',
  emptyMessage = 'No results found.',
  placeholder,
  items = [],
  value = '',
  onChange,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Measure the button width to match the popover width dynamically
  useEffect(() => {
    if (buttonRef.current) {
      setPopoverWidth(buttonRef.current.offsetWidth)
    }
  }, [])

  // Find the selected item based on the current value
  const selectedItem = items.find((item) => item.value === value)

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
          {selectedItem ? selectedItem.label : noValueMessage}
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
                  onSelect={() => {
                    // Toggle selection: deselect if already selected, otherwise select
                    const newValue = item.value === value ? '' : item.value
                    onChange && onChange(newValue)
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
