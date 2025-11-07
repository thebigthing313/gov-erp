import { useLiveSuspenseQuery } from '@tanstack/react-db'
import { time_types } from '../collections/time-types'

export function useTimeTypes() {
  return useLiveSuspenseQuery((q) => q.from({ time_type: time_types }))
}
