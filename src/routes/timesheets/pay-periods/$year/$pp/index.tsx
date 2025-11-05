import { Label } from '@/components/ui/label'
import { usePayPeriod } from '@/db/hooks/use-pay-period'
import { useTimesheets } from '@/db/hooks/use-timesheets'
import { formatDate } from '@/lib/date-fns'
import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/timesheets/pay-periods/$year/$pp/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { year, pp } = Route.useParams()
  const { data: pay_period } = usePayPeriod(year, pp)
  type PayPeriod = typeof pay_period

  const { collection: timesheets_by_year } = useTimesheets(year)
  const { data: timesheets_in_pay_period } = useLiveSuspenseQuery((q) =>
    q
      .from({ timesheet: timesheets_by_year })
      .where(({ timesheet }) => eq(timesheet.pay_period_number, pp))
      .orderBy(({ timesheet }) => timesheet.timesheet_date),
  )

  function getDates(pay_period: PayPeriod | null | undefined): Date[] {
    if (!pay_period) return []

    const current = new Date(pay_period.begin_date)
    const end = pay_period.end_date
    const result: Date[] = []

    while (current <= end) {
      result.push(new Date(current))
      current.setUTCDate(current.getUTCDate() + 1)
    }

    return result
  }

  const dates = getDates(pay_period)

  return (
    <div className="grid grid-cols-7 gap-0">
      {dates.map((date) => {
        return (
          <div key={date.toString()} className="flex flex-col p-2">
            <Label>
              {formatDate(date, {
                weekday: 'long',
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })}
            </Label>
            {/* badge to indicate if date is a weekend or holiday */}
            {/* button to either open existing timesheet or create new one */}
          </div>
        )
      })}
    </div>
  )
}
