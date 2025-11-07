import { eq, useLiveSuspenseQuery } from '@tanstack/react-db'
import { time_types } from '../collections/time-types'
import { ZodTimeTypesRowType } from '../schemas/time_types'

type TimeTypeShortName = { short_name: string }
type TimeTypeFullName = { full_name: string }
type TimeTypeID = { id: string }

export function useTimeType(
  filter: TimeTypeFullName,
): ZodTimeTypesRowType | undefined
export function useTimeType(
  filter: TimeTypeShortName,
): ZodTimeTypesRowType | undefined
export function useTimeType(filter: TimeTypeID): ZodTimeTypesRowType | undefined

export function useTimeType(
  filter: TimeTypeID | TimeTypeFullName | TimeTypeShortName,
): ZodTimeTypesRowType | undefined {
  const { data } = useLiveSuspenseQuery((q) => {
    const query = q.from({ time_type: time_types })
    if ('id' in filter) {
      query.where(({ time_type }) => eq(time_type.id, filter.id))
    } else if ('full_name' in filter) {
      query.where(({ time_type }) => eq(time_type.type_name, filter.full_name))
    } else if ('short_name' in filter) {
      query.where(({ time_type }) =>
        eq(time_type.type_short_name, filter.short_name),
      )
    }
    return query.findOne()
  })
  return data
}
