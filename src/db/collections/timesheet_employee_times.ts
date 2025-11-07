import { Collection } from '@tanstack/react-db'
import { Table } from '../data-types'
import { supabase } from '../client'
import { serializeKey } from '../utils'
import {
  ZodTimesheetEmployeeTimesInsertToDb,
  ZodTimesheetEmployeeTimesInsertType,
  ZodTimesheetEmployeeTimesRow,
  ZodTimesheetEmployeeTimesRowType,
  ZodTimesheetEmployeeTimesUpdateType,
} from '../schemas/timesheet_employee_times'
import { createParameterizedSupabaseCollectionFactory } from './collection-factory'
import { ZodTimesheetEmployeesUpdateToDb } from '../schemas/timesheet_employees'

type MapKey = { date: string }

const cache = new Map<
  string,
  Collection<ZodTimesheetEmployeeTimesRowType, string | number>
>()

const table: Table = 'timesheet_employee_times'

const timesheetEmployeeTimesCollectionFactory =
  createParameterizedSupabaseCollectionFactory<
    [date: string],
    ZodTimesheetEmployeeTimesRowType,
    ZodTimesheetEmployeeTimesInsertType,
    ZodTimesheetEmployeeTimesUpdateType
  >(
    table,
    {
      rowSchema: ZodTimesheetEmployeeTimesRow,
      insertSchema: ZodTimesheetEmployeeTimesInsertToDb,
      updateSchema: ZodTimesheetEmployeesUpdateToDb,
    },
    async (date) => {
      const { data, error } = await supabase
        .from(table)
        .select(
          '*, timesheet_employees!inner(timesheets!inner(timesheet_date))',
        )
        .eq('timesheet_employees.timesheets.timesheet_date', date)
      if (error) throw error
      const strippedData = data.map((item) => {
        const { timesheet_employees, ...rest } = item
        return rest
      })

      const parsedData = strippedData.map((item) =>
        ZodTimesheetEmployeeTimesRow.parse(item),
      )

      return parsedData as Array<ZodTimesheetEmployeeTimesRowType>
    },
    { staleTime: 1000 * 60 * 30 },
  )

export const timesheet_employee_times = ({ date }: MapKey) => {
  const key = serializeKey({ date })
  let collection = cache.get(key)

  if (!collection) {
    collection = timesheetEmployeeTimesCollectionFactory(date)

    collection.on('status:change', ({ status }) => {
      if (status === 'cleaned-up') cache.delete(key)
    })
    cache.set(key, collection)
  }
  return collection
}
