export function formatDate(
  date: Date | undefined,
  options: Omit<Intl.DateTimeFormatOptions, 'timeZone'> = {},
) {
  if (!date) {
    return ''
  }
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...options,
  })
}

export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function getUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day))
}

export function areDatesEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() === date2.getTime()
}
