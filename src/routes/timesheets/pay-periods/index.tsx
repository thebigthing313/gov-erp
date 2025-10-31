import { YearSelector } from '@/components/year-selector'
import { usePayPeriods } from '@/db/hooks/use-pay-periods'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PayPeriodCard } from '../-components/pay-period-card'

export const Route = createFileRoute('/timesheets/pay-periods/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data: pay_periods_by_year, isLoading, isError } = usePayPeriods(year)
  if (isLoading) {
    return <div>Loading pay periods...</div>
  }
  if (isError) {
    return <div>Error loading pay periods.</div>
  }

  return (
    <div className="flex flex-col gap-2">
      <YearSelector value={year} onChange={(year) => setYear(year)} />
      {pay_periods_by_year.map((pay_period) => {
        const cardInfo = {
          id: pay_period.id,
          pay_period_number: pay_period.pay_period_number,
          pay_date: pay_period.pay_date,
          start_date: pay_period.begin_date,
          end_date: pay_period.end_date,
        }
        return <PayPeriodCard key={pay_period.id} pay_period={cardInfo} />
      })}
    </div>
  )
}
