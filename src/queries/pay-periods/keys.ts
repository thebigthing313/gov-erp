export const payperiodKeys = {
  all: ['pay_periods'] as const,
  byYearandEmployee: (year: number, employeeId: string) =>
    [...payperiodKeys.all, 'year', year, 'employee', employeeId] as const,
  year: (year: number) => [...payperiodKeys.all, 'year', year] as const,
  id: (id: string) => [...payperiodKeys.all, 'id', id] as const,
};
