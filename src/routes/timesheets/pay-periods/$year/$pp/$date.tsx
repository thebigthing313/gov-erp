import { Spinner } from '@/components/ui/spinner'
import { timesheet_employees } from '@/db/collections/timesheet_employees'
import { useTimesheet } from '@/db/hooks/use-timesheet'
import { useTimesheetEmployees } from '@/db/hooks/use-timesheet-employees'
import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import z from 'zod'

const ParamsSchema = z.object({
  year: z.coerce.number(),
  pp: z.coerce.number(),
  date: z.iso.date(),
})
export const Route = createFileRoute('/timesheets/pay-periods/$year/$pp/$date')(
  {
    params: {
      parse: (raw) => ParamsSchema.parse(raw),
    },
    component: () => (
      <ErrorBoundary fallback={<div>Error loading data</div>}>
        <Suspense fallback={<Spinner />}>
          <RouteComponent />
        </Suspense>
      </ErrorBoundary>
    ),
  },
)

function RouteComponent() {
  const { date } = Route.useParams()
  const timesheetDate = new Date(date)
  const { data: timesheet } = useTimesheet(timesheetDate)
  const { data: employee_list } = useTimesheetEmployees(timesheet.id)

  return (
    <div>
      {employee_list.map(({ employee }) => (
        <div
          key={employee.id}
        >{`${employee.first_name} ${employee.last_name}`}</div>
      ))}
    </div>
  )
}
