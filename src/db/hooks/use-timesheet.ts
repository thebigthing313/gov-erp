import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheets } from '../collections/timesheets'

export function useTimesheet(date: Date) {
  const year = new Date(date).getUTCFullYear()
  return useLiveSuspenseQuery((q) =>
    q
      .from({ timesheet: timesheets(year) })
      .where(({ timesheet }) => eq(timesheet.timesheet_date, date))
      .findOne(),
  )
}
