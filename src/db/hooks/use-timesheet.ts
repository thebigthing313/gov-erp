import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheets } from '../collections/timesheets'

export function useTimesheet(date: Date) {
  const query = useLiveSuspenseQuery((q) =>
    q
      .from({ timesheet: timesheets })
      .where(({ timesheet }) => eq(timesheet.timesheet_date, date))
      .findOne(),
  )

  const { data, ...rest } = query
  if (!data) throw new Error('Timesheet not found.')
  return { data, ...rest }
}
