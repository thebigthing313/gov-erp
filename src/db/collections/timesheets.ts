import * as TanstackQueryProvider from '@/integrations/tanstack-query/root-provider'
import { supabase } from '../client'
import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import {
  ZodTimesheetsInsertToDb,
  ZodTimesheetsRow,
  ZodTimesheetsUpdateToDb,
} from '../schemas/timesheets'

const { queryClient } = TanstackQueryProvider.getContext()
const table = 'timesheets'

export const timesheets = createCollection(
  queryCollectionOptions({
    id: table,
    queryKey: (opts) => {
      const parsed = parseLoadSubsetOptions(opts)
      const cacheKey = [table]
      parsed.filters.forEach((filter) => {
        const fieldPath = filter.field.join('.')
        let filterValue = filter.value
        if (fieldPath.slice(-5) === '_date') {
          filterValue = filter.value.toISOString().slice(0, 10)
        }
        cacheKey.push(`${fieldPath}-${filter.operator}-${filterValue}`)
      })

      if (parsed.limit) {
        cacheKey.push(`limit-${parsed.limit}`)
      }

      return cacheKey
    },
    queryClient,
    schema: ZodTimesheetsRow,
    getKey: (item) => item.id,
    staleTime: 1000 * 60 * 10,
    syncMode: 'on-demand',
    queryFn: async (ctx) => {
      let query = supabase.from(table).select('*')

      const { filters, sorts } = parseLoadSubsetOptions(
        // @ts-expect-error Library documentation confirms this usage
        ctx.meta?.loadSubsetOptions,
      )

      filters.forEach(({ field, operator, value }) => {
        let filterValue = value
        const fieldPath = field.join('.')
        if (fieldPath.slice(-5) === '_date') {
          filterValue = value.toISOString().slice(0, 10)
        }

        switch (operator) {
          case 'eq':
            query = query.eq(fieldPath, filterValue)
            break
          case 'lt':
            query = query.lt(fieldPath, filterValue)
            break
          case 'lte':
            query = query.lte(fieldPath, filterValue)
            break
          case 'gt':
            query = query.gt(fieldPath, filterValue)
            break
          case 'gte':
            query = query.gte(fieldPath, filterValue)
            break
          case 'in':
            query = query.in(fieldPath, filterValue)
            break
        }
      })

      sorts.forEach(({ field, direction }) => {
        const fieldPath = field.join('.')
        query = query.order(fieldPath, { ascending: direction === 'asc' })
      })

      const { data, error } = await query
      if (error) {
        throw new Error(`Error fetching table <${table}>: ${error.message}`)
      }
      const parsed = data.map((item) => ZodTimesheetsRow.parse(item))
      return parsed
    },
    onInsert: async ({ transaction, collection }) => {
      const localNewItems = transaction.mutations.map((m) => m.modified)

      const parsedLocalNewItems = localNewItems.map((item) =>
        ZodTimesheetsInsertToDb.parse(item),
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
        ZodTimesheetsRow.parse(item),
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
        ZodTimesheetsUpdateToDb.parse(localChangesToApply)

      const { data, error } = await supabase
        .from(table)
        .update(parsedChangesToApply)
        .in('id', localUpdatedKeys)
        .select('*')

      if (error) {
        throw new Error(`Error updating table <${table}>: ${error.message}`)
      }

      const parsedServerUpdatedItems = data.map((item) =>
        ZodTimesheetsRow.parse(item),
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
