import { useLiveSuspenseQuery, and, eq } from '@tanstack/react-db'
import { timesheet_employee_times } from '../collections/timesheet_employee_times'

export function useTimesheetEmployeeTime(
  isoDateString: string,
  timesheet_employee_id: string,
  time_type_id: string,
) {
  return useLiveSuspenseQuery(
    (q) =>
      q
        .from({
          timesheet_employee_time: timesheet_employee_times({
            date: isoDateString,
          }),
        })
        .where(({ timesheet_employee_time }) =>
          and(
            eq(
              timesheet_employee_time.timesheet_employee_id,
              timesheet_employee_id,
            ),
            eq(timesheet_employee_time.time_type_id, time_type_id),
          ),
        )
        .select(({ timesheet_employee_time }) => {
          return {
            timesheet_employee_time_id: timesheet_employee_time.id,
            hours: timesheet_employee_time.hours_amount,
          }
        })
        .findOne(),
    [isoDateString, timesheet_employee_id, time_type_id],
  )
}
