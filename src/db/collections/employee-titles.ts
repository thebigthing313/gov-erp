import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import * as TanstackQueryProvider from '@/integrations/tanstack-query/root-provider'
import {
  ZodEmployeeTitlesInsertToDb,
  ZodEmployeeTitlesRow,
  ZodEmployeeTitlesUpdateToDb,
} from '../schemas/employee_titles'
import { supabase } from '../client'

const { queryClient } = TanstackQueryProvider.getContext()
const table = 'employee_titles'

const cache = new Map<string, ReturnType<typeof employee_titles_factory>>()

export const employee_titles = (employee_id: string) => {
  let collection = cache.get(employee_id)
  if (!collection) {
    collection = employee_titles_factory(employee_id)

    collection.on('status:change', ({ status }) => {
      if (status === 'cleaned-up') {
        cache.delete(employee_id)
      }
    })

    cache.set(employee_id, collection)
  }
  return collection
}

export const employee_titles_factory = (employee_id: string) =>
  createCollection(
    queryCollectionOptions({
      queryKey: [table, employee_id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('employee_id', employee_id)
        if (error) {
          throw new Error(`Error fetching table <${table}>: ${error.message}`)
        }
        const parsed = data.map((item) => ZodEmployeeTitlesRow.parse(item))
        return parsed
      },
      queryClient,
      schema: ZodEmployeeTitlesRow,
      getKey: (item) => item.id,
      onInsert: async ({ transaction, collection }) => {
        const localNewItems = transaction.mutations.map((m) => m.modified)

        const parsedLocalNewItems = localNewItems.map((item) =>
          ZodEmployeeTitlesInsertToDb.parse(item),
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
          ZodEmployeeTitlesRow.parse(item),
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
          ZodEmployeeTitlesUpdateToDb.parse(localChangesToApply)

        const { data, error } = await supabase
          .from(table)
          .update(parsedChangesToApply)
          .in('id', localUpdatedKeys)
          .select('*')

        if (error) {
          throw new Error(`Error updating table <${table}>: ${error.message}`)
        }

        const parsedServerUpdatedItems = data.map((item) =>
          ZodEmployeeTitlesRow.parse(item),
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
