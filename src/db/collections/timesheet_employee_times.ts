import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import * as TanstackQueryProvider from '@/integrations/tanstack-query/root-provider'
import {
  ZodTimesheetEmployeeTimesInsertToDb,
  ZodTimesheetEmployeeTimesRow,
  ZodTimesheetEmployeeTimesUpdateToDb,
} from '../schemas/timesheet_employee_times'
import { supabase } from '../client'

const { queryClient } = TanstackQueryProvider.getContext()
const table = 'timesheet_employee_times'

const cache = new Map<
  string,
  ReturnType<typeof timesheet_employee_times_factory>
>()

export const timesheet_employee_times = (timesheet_employee_id: string) => {
  let collection = cache.get(timesheet_employee_id)
  if (!collection) {
    collection = timesheet_employee_times_factory(timesheet_employee_id)

    collection.on('status:change', ({ status }) => {
      if (status === 'cleaned-up') {
        cache.delete(timesheet_employee_id)
      }
    })

    cache.set(timesheet_employee_id, collection)
  }
  return collection
}

export const timesheet_employee_times_factory = (
  timesheet_employee_id: string,
) =>
  createCollection(
    queryCollectionOptions({
      queryKey: [table, timesheet_employee_id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('timesheet_employee_id', timesheet_employee_id)
        if (error) {
          throw new Error(`Error fetching table <${table}>: ${error.message}`)
        }
        const parsed = data.map((item) =>
          ZodTimesheetEmployeeTimesRow.parse(item),
        )
        return parsed
      },
      queryClient,
      schema: ZodTimesheetEmployeeTimesRow,
      getKey: (item) => item.id,
      onInsert: async ({ transaction, collection }) => {
        const localNewItems = transaction.mutations.map((m) => m.modified)

        const parsedLocalNewItems = localNewItems.map((item) =>
          ZodTimesheetEmployeeTimesInsertToDb.parse(item),
        )

        const { data, error } = await supabase
          .from(table)
          .insert(parsedLocalNewItems)
          .select('*')

        if (error) {
          throw new Error(
            `Error inserting into table <${table}>: ${error.message}`,
          )
        }

        const parsedServerNewItems = data.map((item) =>
          ZodTimesheetEmployeeTimesRow.parse(item),
        )

        collection.utils.writeBatch(() => {
          parsedServerNewItems.forEach((item) =>
            collection.utils.writeUpsert(item),
          )
        })

        return { refetch: false }
      },
      onUpdate: async ({ transaction, collection }) => {
        if (transaction.mutations.length === 0) {
          return { refetch: false }
        }

        const localUpdatedKeys = transaction.mutations.map((m) => m.key)

        const localChangesToApply = transaction.mutations[0].changes

        const parsedChangesToApply =
          ZodTimesheetEmployeeTimesUpdateToDb.parse(localChangesToApply)

        const { data, error } = await supabase
          .from(table)
          .update(parsedChangesToApply)
          .in('id', localUpdatedKeys)
          .select('*')

        if (error) {
          throw new Error(`Error updating table <${table}>: ${error.message}`)
        }

        const parsedServerUpdatedItems = data.map((item) =>
          ZodTimesheetEmployeeTimesRow.parse(item),
        )

        collection.utils.writeBatch(() => {
          parsedServerUpdatedItems.forEach((item) =>
            collection.utils.writeUpsert(item),
          )
        })

        return { refetch: false }
      },
      onDelete: async ({ transaction, collection }) => {
        const localDeletedItemIds = transaction.mutations.map((m) => m.key)

        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .in('id', localDeletedItemIds)

        if (deleteError) {
          throw new Error(
            `Error deleting from table <${table}>: ${deleteError.message}`,
          )
        }

        collection.utils.writeBatch(() => {
          localDeletedItemIds.forEach((id) => collection.utils.writeDelete(id))
        })

        return { refetch: false }
      },
    }),
  )
