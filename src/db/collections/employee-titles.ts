import * as TanstackQueryProvider from '@/integrations/tanstack-query/root-provider'
import { supabase } from '../client'
import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import {
  ZodEmployeeTitlesInsertToDb,
  ZodEmployeeTitlesRow,
  ZodEmployeeTitlesUpdateToDb,
} from '../schemas/employee_titles'

const { queryClient } = TanstackQueryProvider.getContext()
const table = 'employee_titles'

export const employee_titles = createCollection(
  queryCollectionOptions({
    id: table,
    queryKey: (opts) => {
      const parsed = parseLoadSubsetOptions(opts)
      const cacheKey = [table]
      parsed.filters.forEach((filter) => {
        cacheKey.push(
          `${filter.field.join('.')}-${filter.operator}-${filter.value}`,
        )
      })

      if (parsed.limit) {
        cacheKey.push(`limit-${parsed.limit}`)
      }

      return cacheKey
    },
    queryClient,
    schema: ZodEmployeeTitlesRow,
    getKey: (item) => item.id,
    syncMode: 'on-demand',
    queryFn: async (ctx) => {
      let query = supabase.from(table).select('*')

      const { filters, sorts } = parseLoadSubsetOptions(
        // @ts-expect-error Library documentation confirms this usage
        ctx.meta?.loadSubsetOptions,
      )

      filters.forEach(({ field, operator, value }) => {
        const fieldPath = field.join('.')
        switch (operator) {
          case 'eq':
            query = query.eq(fieldPath, value)
            break
          case 'lt':
            query = query.lt(fieldPath, value)
            break
          case 'lte':
            query = query.lte(fieldPath, value)
            break
          case 'gt':
            query = query.gt(fieldPath, value)
            break
          case 'gte':
            query = query.gte(fieldPath, value)
            break
          case 'in':
            query = query.in(fieldPath, value)
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
      const parsed = data.map((item) => ZodEmployeeTitlesRow.parse(item))
      return parsed
    },
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
