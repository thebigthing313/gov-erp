import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheet_employees } from '../collections/timesheet_employees'
import { employees } from '../collections/employees'

export function useTimesheetEmployees(timesheet_date: Date) {
  const isoDateString = new Date(timesheet_date).toISOString().split('T')[0]
  return useLiveSuspenseQuery(
    (q) =>
      q
        .from({
          timesheet_employee: timesheet_employees({ date: isoDateString }),
        })
        .innerJoin(
          { employee: employees },
          ({ employee, timesheet_employee }) =>
            eq(timesheet_employee.employee_id, employee.id),
        )
        .select(({ timesheet_employee, employee }) => ({
          id: timesheet_employee.id,
          timesheet_id: timesheet_employee.timesheet_id,
          employee_id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          is_default_cto: employee.is_default_cto,
          is_late: timesheet_employee.is_late,
          notes: timesheet_employee.notes,
        })),
    [isoDateString],
  )
}
