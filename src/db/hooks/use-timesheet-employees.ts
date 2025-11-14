import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheet_employees } from '../collections/timesheet_employees'
import { employees } from '../collections/employees'

export function useTimesheetEmployees(timesheet_id: string) {
  return useLiveSuspenseQuery(
    (q) =>
      q
        .from({
          timesheet_employee: timesheet_employees,
        })
        .innerJoin(
          { employee: employees },
          ({ employee, timesheet_employee }) =>
            eq(timesheet_employee.employee_id, employee.id),
        )
        .where(({ timesheet_employee }) =>
          eq(timesheet_employee.timesheet_id, timesheet_id),
        ),
    [timesheet_id],
  )
}
