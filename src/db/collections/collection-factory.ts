//---------------------------------------------------------------------------
// future potential improvements:
// Parse within factory and custom queryfn should just return raw data?
// simplify overloads by having separate functions for parameterized and non-parameterized?
//---------------------------------------------------------------------------
import { z } from "zod";
import {
    Collection,
    CollectionConfig,
    createCollection,
} from "@tanstack/react-db";
import {
    queryCollectionOptions,
    QueryCollectionUtils,
} from "@tanstack/query-db-collection";
import { supabase } from "../client";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { Table } from "../data-types";
import { QueryKey } from "@tanstack/react-query";

const { queryClient } = TanstackQueryProvider.getContext();

// ---------------------------------------------------------------------------
// collection-factory.ts
//
// Purpose:
// A small factory layer that creates TanStack DB "Collection" instances backed
// by Supabase. The factory enforces type-safety with Zod schemas and wires up
// standard CRUD handlers (query, insert, update, delete) so collections are
// ready to use in the UI with optimistic updates and server-sync.
//
// Important guarantees:
// - All server responses are parsed with `rowSchema`.
// - Client-side inserts/updates are validated with `insertSchema`/`updateSchema`.
// - The factory returns either a parameterized creator
//   ((...params) => Collection) or a non-parameterized Collection instance.
// - No application logic (transformations) is performed implicitly; parsing is
//   delegated to the provided Zod schemas and any custom query function.
//
// Conventions:
// - All database tables have an `id` field of type UUID
// - Updates apply a single changeset to one or multiple IDs
// - TanStack DB handles rollback when mutation handlers throw
// ---------------------------------------------------------------------------

// Configuration fields commonly passed to TanStack Query hooks
interface TanstackQueryConfig {
    staleTime?: number;
    enabled?: boolean;
    // Add any other common TanStack Query options you need to pass through
}

// Helper type to safely define the core configuration object for the factory
type FactoryConfig<TItem extends { id: string }> =
    & Partial<
        Omit<
            & CollectionConfig<TItem, string | number, never, any>
            & {
                schema?: undefined;
                utils: QueryCollectionUtils<TItem, string | number, any, any>;
            },
            | "queryKey"
            | "queryFn"
            | "onInsert"
            | "onUpdate"
            | "onDelete"
            | "getKey"
        >
    >
    & TanstackQueryConfig;

// Notes on FactoryConfig:
// - This type is mostly a passthrough for configuration accepted by
//   `createCollection` / TanStack DB hooks while preventing callers from
//   overriding keys that the factory provides (like queryKey/queryFn/getKey
//   and the mutation handlers: onInsert/onUpdate/onDelete).
/// - TItem is constrained to have an `id` field per database convention.

// --- 1. Define the Required Interface for Generics ---
interface SupabaseCollectionSchemas<
    TItem extends { id: string },
    TInsert,
    TUpdate,
> {
    // Schema for the full item (Read/Output, with all server-generated fields)
    rowSchema: z.ZodType<TItem, any, any>;
    // Schema for the client input on Insert (Audit fields are optional/omitted)
    insertSchema: z.ZodType<TInsert, any, any>;
    // Schema for the client input on Update (Partial item)
    updateSchema: z.ZodType<TUpdate, any, any>;
}

// Notes on schemas:
// - rowSchema: used to validate/parse server responses (full record shape).
// - insertSchema: used to validate data before sending INSERT requests.
// - updateSchema: used to validate (usually partial) updates before sending
//   UPDATE requests. Keeping these separate ensures you don't accidentally
//   send server-generated fields in mutations.

// --- 2. The Parameterized Factory Function ---

// Overload 1: Parameterized factory result (custom query function is required)
export function createParameterizedSupabaseCollectionFactory<
    TParams extends any[],
    TItem extends { id: string },
    TInsert extends object,
    TUpdate extends object,
>(
    tableName: Table,
    schemas: SupabaseCollectionSchemas<TItem, TInsert, TUpdate>,
    customQueryFn: (...params: TParams) => Promise<TItem[]>,
    config: FactoryConfig<TItem>,
): (...params: TParams) => Collection<TItem, string | number>;

// Overload 2: Non-parameterized factory result (custom query function is required by overload structure)
export function createParameterizedSupabaseCollectionFactory<
    TItem extends { id: string },
    TInsert extends object,
    TUpdate extends object,
>(
    tableName: Table,
    schemas: SupabaseCollectionSchemas<TItem, TInsert, TUpdate>,
    customQueryFn: (...params: []) => Promise<TItem[]>,
    config: FactoryConfig<TItem>,
): () => Collection<TItem, string | number>;

// Base Implementation (Handles both parameterized and non-parameterized calls)
export function createParameterizedSupabaseCollectionFactory<
    TParams extends any[],
    TItem extends { id: string },
    TInsert extends object,
    TUpdate extends object,
>(
    tableName: Table,
    schemas: SupabaseCollectionSchemas<TItem, TInsert, TUpdate>,
    customQueryFn:
        | ((...params: TParams) => Promise<TItem[]>)
        | FactoryConfig<TItem>, // customQueryFn can be the config object in the non-param case
    config?: FactoryConfig<TItem>,
):
    | ((...params: TParams) => Collection<TItem, string | number>)
    | (() => Collection<TItem, string | number>) {
    // Logic to distinguish between the two overloads.
    // The factory is intentionally flexible so callers can either provide a
    // custom query function (parameterized or not) or pass a config object in
    // the 3rd argument when they want the default query behavior.
    let finalCustomQueryFn: (...params: TParams) => Promise<TItem[]>;
    let finalConfig: FactoryConfig<TItem>;

    if (typeof customQueryFn === "function") {
        // Case 1: caller provided an explicit custom query function. Use it
        // directly and expect a separate `config` argument.
        finalCustomQueryFn = customQueryFn;
        finalConfig = config!; // config must be present in this case
    } else {
        // Case 2: caller passed the config object as the 3rd argument and
        // omitted a custom query function. Provide a default query function
        // that selects all rows from the table and parses them with `rowSchema`.
        finalConfig = customQueryFn; // The config object was passed as the 3rd argument

        // Default query function for the non-parameterized convenience case.
        // We parse server rows here to ensure the returned TItem[] matches the
        // expected runtime shape.
        finalCustomQueryFn = (async () => {
            const { data, error } = await supabase.from(tableName).select("*");
            if (error) {
                throw new Error(
                    `Failed to query ${tableName}: ${error.message}`,
                    { cause: error },
                );
            }
            return data.map((item) => schemas.rowSchema.parse(item));
        }) as (...params: TParams) => Promise<TItem[]>;
    }

    const { rowSchema, insertSchema, updateSchema } = schemas;

    const collectionCreator = (
        ...params: TParams
    ): Collection<TItem, string | number> => {
        // Each collection instance is identified by a queryKey consisting of
        // the table name and any provided parameters. This key drives caching
        // and deduplication in TanStack Query/DB.
        const queryKey: QueryKey = [tableName, ...params];

        return createCollection(
            queryCollectionOptions<TItem>({
                queryKey,
                queryClient,
                // Extract the `id` field per database convention
                getKey: (item) => item.id,
                ...finalConfig,

                // ------------------------------------
                //           QUERY HANDLER (READ)
                // ------------------------------------
                // Responsible for returning the initial data for the
                // collection. The factory delegates to `finalCustomQueryFn` so
                // callers can supply custom filtering/join logic. The query
                // function should already return parsed `TItem` objects.
                queryFn: async () => {
                    // Call the custom query function with params
                    const result = await finalCustomQueryFn(...params);

                    // The result is already correctly parsed/typed by the customQueryFn
                    return result;
                },

                // ------------------------------------
                //           INSERT HANDLER (CREATE)
                // ------------------------------------
                // Called when the collection receives local insert mutations.
                // Steps:
                // 1. Extract local new items from the transaction and validate
                //    them with insertSchema.
                // 2. Send them to Supabase using `.insert()` and `.select("*")`
                //    to get server-generated fields.
                // 3. Parse server responses with rowSchema and upsert them into
                //    the collection's local cache.
                onInsert: async ({ transaction, collection }) => {
                    const localNewItems = transaction.mutations.map((m) =>
                        m.modified
                    );

                    const parsedLocalNewItems = localNewItems.map((item) =>
                        insertSchema.parse(item)
                    );

                    const { data: serverNewItems, error: insertError } =
                        await supabase
                            .from(tableName)
                            .insert(parsedLocalNewItems)
                            .select("*");

                    if (insertError) {
                        throw new Error(
                            `Failed to insert into ${tableName}: ${insertError.message}`,
                            { cause: insertError },
                        );
                    }

                    // Per Supabase docs: no error means data is an array (possibly empty)
                    const parsedServerNewItems = serverNewItems!.map((item) =>
                        rowSchema.parse(item)
                    );

                    // Batch local writes for a single atomic update to the
                    // collection's local cache.
                    collection.utils.writeBatch(() => {
                        parsedServerNewItems.forEach((item) =>
                            collection.utils.writeUpsert(item)
                        );
                    });

                    // We already updated local state to match the server
                    // response, so avoid an extra refetch.
                    return { refetch: false };
                },

                // ------------------------------------
                //           UPDATE HANDLER
                // ------------------------------------
                // Convention: Apply a single changeset to one or multiple IDs
                onUpdate: async ({ transaction, collection }) => {
                    if (transaction.mutations.length === 0) {
                        return { refetch: false };
                    }

                    const localUpdatedKeys = transaction.mutations.map((m) =>
                        m.key
                    );
                    // Apply the first mutation's changes to all selected IDs
                    const localChangesToApply =
                        transaction.mutations[0].changes;

                    const parsedChangesToApply = updateSchema.parse(
                        localChangesToApply,
                    );

                    const { data: serverUpdatedItems, error: updateError } =
                        await supabase
                            .from(tableName)
                            .update(parsedChangesToApply)
                            .in("id", localUpdatedKeys)
                            .select("*");

                    if (updateError) {
                        throw new Error(
                            `Failed to update ${tableName}: ${updateError.message}`,
                            { cause: updateError },
                        );
                    }

                    const parsedServerUpdatedItems = serverUpdatedItems!.map((
                        item,
                    ) => rowSchema.parse(item));

                    collection.utils.writeBatch(() => {
                        parsedServerUpdatedItems.forEach((item) =>
                            collection.utils.writeUpsert(item)
                        );
                    });

                    return { refetch: false };
                },

                // ------------------------------------
                //           DELETE HANDLER
                // ------------------------------------
                onDelete: async ({ transaction, collection }) => {
                    const localDeletedItemIds = transaction.mutations.map((m) =>
                        m.key
                    );

                    const { error: deleteError } = await supabase.from(
                        tableName,
                    )
                        .delete()
                        .in("id", localDeletedItemIds);

                    if (deleteError) {
                        throw new Error(
                            `Failed to delete from ${tableName}: ${deleteError.message}`,
                            { cause: deleteError },
                        );
                    }

                    collection.utils.writeBatch(() => {
                        localDeletedItemIds.forEach((id) =>
                            collection.utils.writeDelete(id)
                        );
                    });

                    return { refetch: false };
                },
            }),
        );
    };

    return collectionCreator;
}

// --- 3. The Non-Parameterized Convenience Wrapper ---
export function createSupabaseCollection<
    TItem extends { id: string },
    TInsert extends object,
    TUpdate extends object,
>(
    tableName: Table,
    schemas: SupabaseCollectionSchemas<TItem, TInsert, TUpdate>,
    config: FactoryConfig<TItem>,
): Collection<TItem, string | number> {
    const defaultQueryFn = (async () => {
        const { data, error } = await supabase.from(tableName).select("*");
        if (error) {
            throw new Error(`Failed to query ${tableName}: ${error.message}`, {
                cause: error,
            });
        }
        return data.map((item) => schemas.rowSchema.parse(item));
    }) as (...params: []) => Promise<TItem[]>;

    return createParameterizedSupabaseCollectionFactory<
        TItem,
        TInsert,
        TUpdate
    >(
        tableName,
        schemas,
        defaultQueryFn,
        config,
    )();
}
