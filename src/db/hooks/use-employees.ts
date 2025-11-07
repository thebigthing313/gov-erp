import { useLiveSuspenseQuery } from '@tanstack/react-db'
import { employees } from '../collections/employees'

export function useEmployees() {
  return useLiveSuspenseQuery((q) => q.from({ employees: employees }))
}
