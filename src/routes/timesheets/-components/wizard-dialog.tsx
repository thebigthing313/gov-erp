import { Typography } from '@/components/typography'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useHolidays } from '@/db/hooks/use-holidays'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatDate } from '@/lib/date-fns'
import { getHolidayDate } from '../-lib/holiday-wizard'
import { useEffect, useMemo, useState } from 'react'

interface WizardDialogProps {
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WizardDialog({ year, open, onOpenChange }: WizardDialogProps) {
  const isMobile = useIsMobile()
  const { missingHolidaysByYear, holiday_dates } = useHolidays(year)

  // Safely handle loading state with memoization
  const missingHolidayCalculatedDates = useMemo(
    () =>
      missingHolidaysByYear.data?.map((holiday) => ({
        ...holiday,
        holiday_date: getHolidayDate(year, holiday.id),
      })) || [],
    [missingHolidaysByYear.data, year],
  )

  const [holidaysToAdd, setHolidaysToAdd] = useState(
    missingHolidayCalculatedDates,
  )

  // Update state when data loads
  useEffect(() => {
    setHolidaysToAdd(missingHolidayCalculatedDates)
  }, [missingHolidayCalculatedDates])

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Holiday List</DialogTitle>
          <DialogDescription className="flex flex-col gap-2 text-sm tracking-tighter">
            Automatically generate a list of holidays for the selected year.
            This wizard will only create holidays that do not already exist for
            the year. Note: Only the actual date of the holiday will be added.
            If you need to add a custom date due to a holiday falling on a
            weekend, use the "Add Holiday" button.
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
                  <div
                    key={holiday.id}
                    className="flex flex-row justify-between items-center text-sm"
                  >
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
          <Button
            variant="outline"
            onClick={() => {
              insertHolidays()
              onOpenChange(false)
            }}
          >
            Insert Holidays
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
