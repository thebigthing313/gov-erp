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
import { useHolidayDates } from '@/db/hooks/use-holiday-dates'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatDate } from '@/lib/date-fns'
import { getHolidayDate } from '../-lib/holiday-wizard'
import { useHolidays } from '@/db/hooks/use-holidays'
import { useLiveQuery } from '@tanstack/react-db'
import { eq, isUndefined } from '@tanstack/react-db'
import { holiday_dates } from '@/db/collections/holiday-dates'
import { useMemo, useState } from 'react'

interface WizardDialogProps {
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WizardDialog({
  year,
  open,
  onOpenChange,
}: WizardDialogProps) {
  const isMobile = useIsMobile()
  const {
    collection: active_holidays_collection,
    isLoading: isLoadingHolidays,
    isError: isErrorHolidays,
  } = useHolidays()
  const {
    collection: holiday_dates_by_year_collection,
    isLoading: isLoadingHolidayDates,
    isError: isErrorHolidayDates,
  } = useHolidayDates(year)
  if (isLoadingHolidays || isLoadingHolidayDates) {
    return <div>Loading...</div>
  }
  if (isErrorHolidays || isErrorHolidayDates) {
    return <div>Error loading data.</div>
  }

  const missing_holidays = useLiveQuery(
    (q) =>
      q
        .from({ holiday: active_holidays_collection })
        .leftJoin(
          { holiday_date: holiday_dates_by_year_collection },
          ({ holiday, holiday_date }) =>
            eq(holiday.id, holiday_date.holiday_id),
        )
        .where(({ holiday_date }) => isUndefined(holiday_date))
        .fn.select((row) => ({
          id: row.holiday.id,
          name: row.holiday.name,
          calculated_holiday_date: getHolidayDate(year, row.holiday.id),
        })),
    [year],
  )

  const filtered_missing_holidays: Array<{
    id: string
    name: string
    holiday_date: Date
  }> = useMemo(() => {
    if (!missing_holidays.data) return []
    return missing_holidays.data
      .filter((holiday) => holiday.calculated_holiday_date !== null)
      .map((holiday) => ({
        id: holiday.id,
        name: holiday.name,
        holiday_date: holiday.calculated_holiday_date!, // Safe after null filter
      }))
  }, [missing_holidays.data])

  const [holidaysToAdd, setHolidaysToAdd] = useState<
    Array<{ id: string; name: string; holiday_date: Date }>
  >(filtered_missing_holidays)

  function removeFromList(holidayId: string) {
    setHolidaysToAdd((prev) =>
      prev.filter((existingId) => existingId.id !== holidayId),
    )
  }

  function insertHolidays() {
    const batchInsert = holidaysToAdd.map((holiday) => ({
      id: crypto.randomUUID().toString(),
      holiday_id: holiday.id,
      holiday_date: holiday.holiday_date,
    }))

    holiday_dates.insert(batchInsert)
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
