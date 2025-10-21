import { YearSelector } from '@/components/year-selector'
import { useHolidays } from '@/db/hooks/use-holidays'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const { query } = useHolidays(currentYear)

  return <YearSelector />
}
