import { useLiveSuspenseQuery } from '@tanstack/react-db'
import { timesheet_employee_times } from '../collections/timesheet_employee_times'

export function useTimesheetEmployeeTimes(timesheet_id: string) {
  return useLiveSuspenseQuery