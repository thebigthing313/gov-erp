import { HolidayCard } from '@/components/cards/holiday-card'
import { Typography } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { YearSelector } from '@/components/year-selector'
import { useHolidays } from '@/db/hooks/use-holidays'
import { formatDate } from '@/lib/date-fns'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon, PrinterIcon, WandSparkles } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const { query } = useHolidays(currentYear)
  const holidays = query.data

  return (
    <div className="max-w-3xl flex flex-col gap-2">
      <Typography tag="h3">Holiday Schedule</Typography>
      <nav className="flex flex-row items-center gap-4">
        <ButtonGroup className="" orientation="horizontal">
          <YearSelector
            value={currentYear}
            onChange={(year) => setCurrentYear(year)}
            className="w-48"
          />
          <HolidayWizard />
          <NewHolidayButton />
          <PrintButton />
        </ButtonGroup>
      </nav>
      <div className="flex flex-row flex-wrap gap-0">
        {holidays.map((holiday, index) => {
          const { name } = holiday.holidays
          const { id, holiday_date } = holiday.holiday_dates
          const formattedDate = formatDate(holiday_date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
          })
          return (
            <HolidayCard
              index={index + 1}
              key={id}
              title={name}
              description={formattedDate}
              className="min-w-xs not-odd:bg-muted/50"
            />
          )
        })}
      </div>
    </div>
  )
}

function NewHolidayButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add Holiday</TooltipContent>
    </Tooltip>
  )
}

function HolidayWizard() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <WandSparkles />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Generate Holiday List</TooltipContent>
    </Tooltip>
  )
}

function PrintButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <PrinterIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Print</TooltipContent>
    </Tooltip>
  )
}
