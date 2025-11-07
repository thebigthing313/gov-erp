import { useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheet_employee_times } from '../collections/timesheet_employee_times'

export function useTimesheetEmployeeTimes(isoDateString: string) {
  return useLiveSuspenseQuery((q) =>
    q.from({
      timesheet_employee_time: timesheet_employee_times({
        date: isoDateString,
      }),
    }),
  )
}
