import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import * as TanstackQueryProvider from '@/integrations/tanstack-query/root-provider'
import {
  ZodTimesheetEmployeesInsertToDb,
  ZodTimesheetEmployeesRow,
  ZodTimesheetEmployeesUpdateToDb,
} from '../schemas/timesheet_employees'
import { supabase } from '../client'

const { queryClient } = TanstackQueryProvider.getContext()
const table = 'timesheet_employees'

const cache = new Map<string, ReturnType<typeof timesheet_employees_factory>>()

export const timesheet_employees = (timesheet_id: string) => {
  let collection = cache.get(timesheet_id)
  if (!collection) {
    collection = timesheet_employees_factory(timesheet_id)

    collection.on('status:change', ({ status }) => {
      if (status === 'cleaned-up') {
        cache.delete(timesheet_id)
      }
    })

    cache.set(timesheet_id, collection)
  }
  return collection
}

export const timesheet_employees_factory = (timesheet_id: string) =>
  createCollection(
    queryCollectionOptions({
      queryKey: [table, timesheet_id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('timesheet_id', timesheet_id)
        if (error) {
          throw new Error(`Error fetching table <${table}>: ${error.message}`)
        }
        const parsed = data.map((item) => ZodTimesheetEmployeesRow.parse(item))
        return parsed
      },
      queryClient,
      schema: ZodTimesheetEmployeesRow,
      getKey: (item) => item.id,
      onInsert: async ({ transaction, collection }) => {
        const localNewItems = transaction.mutations.map((m) => m.modified)

        const parsedLocalNewItems = localNewItems.map((item) =>
          ZodTimesheetEmployeesInsertToDb.parse(item),
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
          ZodTimesheetEmployeesRow.parse(item),
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
          ZodTimesheetEmployeesUpdateToDb.parse(localChangesToApply)

        const { data, error } = await supabase
          .from(table)
          .update(parsedChangesToApply)
          .in('id', localUpdatedKeys)
          .select('*')

        if (error) {
          throw new Error(`Error updating table <${table}>: ${error.message}`)
        }

        const parsedServerUpdatedItems = data.map((item) =>
          ZodTimesheetEmployeesRow.parse(item),
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
