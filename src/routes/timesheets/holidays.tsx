import { HolidayCard } from '@/components/cards/holiday-card'
import { Typography } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { getHolidayDate } from './-lib/holiday-wizard'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const { holidayDatesByYear } = useHolidays(currentYear)
  const holidays = holidayDatesByYear.data

  return (
    <div className="max-w-3xl flex flex-col gap-2">
      <Typography tag="h3">Paid Holiday Schedule</Typography>
      <nav className="flex flex-row items-center gap-4">
        <ButtonGroup className="" orientation="horizontal">
          <YearSelector
            value={currentYear}
            onChange={(year) => setCurrentYear(year)}
            className="w-48"
          />
          <WizardDialog year={currentYear} />
          <NewHolidayButton />
          <PrintButton />
        </ButtonGroup>
      </nav>
      <div className="flex flex-row flex-wrap gap-0">
        {holidays.map((holiday, index) => {
          const formattedDate = formatDate(holiday.holiday_date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
          })
          return (
            <HolidayCard
              index={index + 1}
              key={holiday.holiday_id}
              title={holiday.name}
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
        <Button type="button" variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add Holiday</TooltipContent>
    </Tooltip>
  )
}

function PrintButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline" size="icon">
          <PrinterIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Print</TooltipContent>
    </Tooltip>
  )
}

function WizardDialog({ year }: { year: number }) {
  const isMobile = useIsMobile()
  const { missingHolidaysByYear, holiday_dates } = useHolidays(year)
  const missingHolidayCalculatedDates = missingHolidaysByYear.data.map(
    (holiday) => {
      return {
        ...holiday,
        holiday_date: getHolidayDate(year, holiday.id),
      }
    },
  )

  const [holidaysToAdd, setHolidaysToAdd] = useState(
    missingHolidayCalculatedDates,
  )

  function removeFromList(holidayId: string) {
    setHolidaysToAdd((prev) =>
      prev.filter((existingId) => existingId.id !== holidayId),
    )
  }

  function insertHolidays() {
    const batchInsert = holidaysToAdd.map((holiday) => {
      return {
        id: crypto.randomUUID().toString(),
        holiday_id: holiday.id,
        holiday_date: holiday.holiday_date,
      }
    })

    holiday_dates.insert(batchInsert as any)
  }

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setHolidaysToAdd(missingHolidayCalculatedDates)
              }}
            >
              <WandSparkles />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Generate Holiday List</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Holiday List</DialogTitle>
          <DialogDescription className="flex flex-col gap-2 text-sm tracking-tighter">
            <p>
              Automatically generate a list of holidays for the selected year.
              This wizard will only create holidays that do not already exist
              for the year.
            </p>
            <p>
              Note: Only the actual date of the holiday will be added. If you
              need to add a custom date due to a holiday falling on a weekend,
              use the "Add Holiday" button.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {holidaysToAdd.length === 0 ? (
            <Typography tag={'lg'}>
              No missing holidays to generate for {year}.
            </Typography>
          ) : (
            holidaysToAdd.map((holiday, index) => {
              if (holiday.holiday_date) {
                const formatOptions: Omit<
                  Intl.DateTimeFormatOptions,
                  'timeZone'
                > = isMobile
                  ? {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                    }
                  : {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                const formattedDate = formatDate(
                  holiday.holiday_date,
                  formatOptions,
                )
                return (
                  <div className="flex flex-row justify-between items-center text-sm">
                    <span className="font-semibold">
                      {index + 1}. {holiday.name}
                    </span>
                    <span className="flex flex-row gap-2 items-center tracking-tight">
                      {formattedDate}

                      <Button
                        className="size-2 text-xs"
                        type="button"
                        variant="link"
                        onClick={() => removeFromList(holiday.id)}
                      >
                        remove
                      </Button>
                    </span>
                  </div>
                )
              }
            })
          )}
        </div>
        <DialogFooter>
          <DialogClose>
            <Button
              variant="outline"
              onClick={() => {
                insertHolidays()
              }}
            >
              Insert Holidays
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
