import { HolidayCard } from '@/components/cards/holiday-card'
import { Typography } from '@/components/typography'
import { YearSelector } from '@/components/year-selector'
import { useHolidays } from '@/db/hooks/use-holidays'
import { formatDate } from '@/lib/date-fns'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const { query } = useHolidays(currentYear)
  const holidays = query.data

  return (
    <div className="max-w-3xl flex flex-col gap-2 items-center">
      <Typography tag="h2">Holiday Schedule</Typography>
      <YearSelector
        value={currentYear}
        onChange={(year) => setCurrentYear(year)}
      />
      <div className="flex flex-row flex-wrap gap-0 justify-center">
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
