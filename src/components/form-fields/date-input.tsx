'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDate } from '@/lib/date-fns'

/**
 * Props for the DateInput component.
 */
interface DateInputProps {
  startDate?: Date
  endDate?: Date
  layout?: 'dropdown' | 'label' | 'dropdown-months' | 'dropdown-years'
  /** The selected date value. */
  value?: Date
  /** Callback when date changes. */
  onChange?: (date: Date | undefined) => void
  /** Placeholder text when no date is selected. */
  placeholder?: string
  /** Additional CSS classes. */
  className?: string
}

/**
 * A controlled date input component using a popover calendar.
 * @param props - The component props.
 * @returns The rendered date input JSX element.
 */
export function DateInput({
  startDate,
  endDate,
  value,
  layout = 'dropdown',
  onChange,
  placeholder = 'Select date',
  className,
  ...props
}: DateInputProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={`flex flex-col gap-3 ${className || ''}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal"
          >
            {value ? formatDate(value) : placeholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            defaultMonth={value}
            startMonth={startDate}
            endMonth={endDate}
            timeZone="UTC"
            mode="single"
            selected={value}
            captionLayout={layout}
            onSelect={(selected) => {
              if (selected) {
                onChange?.(selected)
              } else {
                onChange?.(undefined)
              }
              setOpen(false)
            }}
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
