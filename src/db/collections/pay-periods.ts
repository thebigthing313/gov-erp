import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import * as TanstackQueryProvider from '@/integrations/tanstack-query/root-provider'
import {
  ZodPayPeriodsInsertToDb,
  ZodPayPeriodsRow,
  ZodPayPeriodsUpdateToDb,
} from '../schemas/pay_periods'
import { supabase } from '../client'

const { queryClient } = TanstackQueryProvider.getContext()
const table = 'pay_periods'

export const pay_periods = createCollection(
  queryCollectionOptions({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        throw new Error(`Error fetching table <${table}>: ${error.message}`)
      }
      const parsed = data.map((item) => ZodPayPeriodsRow.parse(item))
      return parsed
    },
    queryClient,
    schema: ZodPayPeriodsRow,
    getKey: (item) => item.id,
    onInsert: async ({ transaction, collection }) => {
      const localNewItems = transaction.mutations.map((m) => m.modified)

      const parsedLocalNewItems = localNewItems.map((item) =>
        ZodPayPeriodsInsertToDb.parse(item),
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
        ZodPayPeriodsRow.parse(item),
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
        ZodPayPeriodsUpdateToDb.parse(localChangesToApply)

      const { data, error } = await supabase
        .from(table)
        .update(parsedChangesToApply)
        .in('id', localUpdatedKeys)
        .select('*')

      if (error) {
        throw new Error(`Error updating table <${table}>: ${error.message}`)
      }

      const parsedServerUpdatedItems = data.map((item) =>
        ZodPayPeriodsRow.parse(item),
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
