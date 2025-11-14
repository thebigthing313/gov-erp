import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { pay_periods } from '../collections/pay-periods'

export function usePayPeriod(year: number, pp: number) {
  const query = useLiveSuspenseQuery(
    (q) =>
      q
        .from({ pay_period: pay_periods })
        .where(({ pay_period }) => eq(pay_period.pay_period_number, pp))
        .where(({ pay_period }) => eq(pay_period.payroll_year, year))
        .findOne(),
    [year, pp],
  )

  const { data, ...rest } = query
  if (!data) throw new Error('Pay period not found.')
  return { data, ...rest }
}

export function getDatesArray(startDate: Date, endDate: Date): Date[] {
  const result: Date[] = []

  while (startDate <= endDate) {
    result.push(new Date(startDate))
    startDate.setUTCDate(startDate.getUTCDate() + 1)
  }

  return result
}
