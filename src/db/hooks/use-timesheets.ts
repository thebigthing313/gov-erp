import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheets } from '../collections/timesheets'

export function useTimesheets(pay_period_id: string) {
  return useLiveSuspenseQuery(
    (q) =>
      q
        .from({ timesheet: timesheets })
        .where(({ timesheet }) => eq(timesheet.pay_period_id, pay_period_id))
        .orderBy(({ timesheet }) => timesheet.timesheet_date),
    [pay_period_id],
  )
}
