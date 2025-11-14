import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { timesheets } from '@/db/collections/timesheets'
import { useIsHoliday } from '@/db/hooks/use-is-holiday'
import { getDatesArray, usePayPeriod } from '@/db/hooks/use-pay-period'
import { useTimesheets } from '@/db/hooks/use-timesheets'
import { ZodTimesheetsRowType } from '@/db/schemas/timesheets'
import { formatDate } from '@/lib/date-fns'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'

export const Route = createFileRoute('/timesheets/pay-periods/$year/$pp/')({
  component: () => (
    <ErrorBoundary fallback={<div>Error loading data</div>}>
      <Suspense fallback={<Spinner />}>
        <RouteComponent />
      </Suspense>
    </ErrorBoundary>
  ),
})

function RouteComponent() {
  const { year, pp } = Route.useParams()
  const { data: pay_period } = usePayPeriod(year, pp)
  const { data: timesheets_for_period } = useTimesheets(pay_period.id)
  const datesThatExist = timesheets_for_period.map((ts) => ts.timesheet_date)

  if (!pay_period) {
    return <div>Pay period not found.</div>
  }

  const startDate = new Date(pay_period.begin_date)
  const endDate = new Date(pay_period.end_date)

  const dates = getDatesArray(startDate, endDate)

  return (
    <ItemGroup className="grid grid-rows-7 grid-flow-col w-fit">
      {dates.map((date) => {
        const exists = datesThatExist.some(
          (existingDate) => existingDate.getTime() === date.getTime(),
        )
        return (
          <Item className="w-sm" key={date.toISOString()} variant="outline">
            <ItemContent>
              <ItemTitle>
                {formatDate(date, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </ItemTitle>
              <ItemDescription>
                <TimesheetHolidayBadge date={date} />
                <TimesheetWeekendBadge date={date} />
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              {exists ? (
                <OpenTimesheetButton date={date} />
              ) : (
                <CreateTimesheetButton date={date} />
              )}
            </ItemActions>
          </Item>
        )
      })}
    </ItemGroup>
  )
}

function TimesheetWeekendBadge({ date }: { date: Date }) {
  const dayOfWeek = date.getUTCDay()
  if (dayOfWeek === 0 || dayOfWeek === 6)
    return <Badge variant="secondary">Weekend</Badge>
  else return null
}

function TimesheetHolidayBadge({ date }: { date: Date }) {
  const { holiday } = useIsHoliday(date)
  if (holiday) return <Badge variant="default">{holiday}</Badge>
  else return null
}

function OpenTimesheetButton({ date }: { date: Date }) {
  const isoDateString = date.toISOString().substring(0, 10)

  return (
    <Button variant="default" asChild>
      <Link
        from="/timesheets/pay-periods/$year/$pp/"
        to="./$date"
        params={{ date: isoDateString }}
      >
        Open
      </Link>
    </Button>
  )
}

function CreateTimesheetButton({ date }: { date: Date }) {
  const { year, pp } = Route.useParams()
  const { data: pay_period } = usePayPeriod(year, pp)
  const navigate = useNavigate()
  const isoDateString = date.toISOString().substring(0, 10)

  function handleCreate() {
    if (!pay_period) {
      toast.error('Unable to retrieve pay period ID.')
      return
    }

    const row: ZodTimesheetsRowType = {
      id: crypto.randomUUID(),
      pay_period_id: pay_period.id,
      timesheet_date: date,
      notes: null,
    }

    timesheets.insert(row)
    navigate({
      from: '/timesheets/pay-periods/$year/$pp/',
      to: './$date',
      params: { date: isoDateString },
    })
  }

  return (
    <Button
      variant="secondary"
      onClick={() => {
        handleCreate()
      }}
    >
      Create
    </Button>
  )
}
