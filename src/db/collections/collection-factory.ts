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
import { Table } from "../data-types"; // Assuming 'Table' is your Supabase table name union type
import { QueryKey } from "@tanstack/react-query"; // Import for QueryKey type

const { queryClient } = TanstackQueryProvider.getContext();

// Configuration fields commonly passed to TanStack Query hooks
interface TanstackQueryConfig {
    staleTime?: number;
    enabled?: boolean;
    // Add any other common TanStack Query options you need to pass through
}

// Helper type to safely define the core configuration object for the factory
// FIX: TItem must explicitly extend object here to resolve compilation error 2344
type FactoryConfig<TItem extends object> =
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

// --- 1. Define the Required Interface for Generics ---
interface SupabaseCollectionSchemas<TItem extends object, TInsert, TUpdate> {
    // Schema for the full item (Read/Output, with all server-generated fields)
    rowSchema: z.ZodType<TItem, any, any>;
    // Schema for the client input on Insert (Audit fields are optional/omitted)
    insertSchema: z.ZodType<TInsert, any, any>;
    // Schema for the client input on Update (Partial item)
    updateSchema: z.ZodType<TUpdate, any, any>;
}

// --- 2. The Parameterized Factory Function ---

// Overload 1: Parameterized factory result (custom query function is required)
export function createParameterizedSupabaseCollectionFactory<
    TParams extends any[],
    TItem extends object,
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
    TItem extends object,
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
    TParams extends any[] = [],
    TItem extends object = any,
    TInsert extends object = any,
    TUpdate extends object = any,
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
    // Logic to distinguish between the two overloads
    let finalCustomQueryFn: (...params: TParams) => Promise<TItem[]>;
    let finalConfig: FactoryConfig<TItem>;

    if (typeof customQueryFn === "function") {
        // Case 1: Custom Query Fn was explicitly provided (Parameterized or Non-Param)
        finalCustomQueryFn = customQueryFn;
        finalConfig = config!; // config must be present in this case
    } else {
        // Case 2: Custom Query Fn was omitted (Non-Parameterized Wrapper)
        finalConfig = customQueryFn; // The config object was passed as the 3rd argument

        // Define the default queryFn which must include the parsing for the non-parameterized wrapper!
        finalCustomQueryFn = (async () => {
            const { data, error } = await supabase.from(tableName).select("*");
            if (error) throw error;
            // ONLY parse here in the default non-parameterized case
            return data.map((item) => schemas.rowSchema.parse(item));
        }) as (...params: TParams) => Promise<TItem[]>;
    }

    const { rowSchema, insertSchema, updateSchema } = schemas;

    const collectionCreator = (
        ...params: TParams
    ): Collection<TItem, string | number> => {
        const queryKey: QueryKey = [tableName, ...params];

        return createCollection(
            queryCollectionOptions<TItem>({
                queryKey,
                queryClient,
                getKey: (item) => (item as any).id, // Generic key extraction
                ...finalConfig,

                // ------------------------------------
                //           QUERY HANDLER (READ)
                // ------------------------------------
                queryFn: async () => {
                    // Call the custom query function with params
                    const result = await finalCustomQueryFn(...params);

                    // The result is already correctly parsed/typed by the customQueryFn
                    return result;
                },

                // ------------------------------------
                //           INSERT HANDLER (CREATE)
                // ------------------------------------
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

                    if (insertError) throw insertError;

                    // Use the specific rowSchema for final server response confirmation/parsing
                    const parsedServerNewItems = serverNewItems.map((item) =>
                        rowSchema.parse(item)
                    );

                    collection.utils.writeBatch(() => {
                        parsedServerNewItems.forEach((item) =>
                            collection.utils.writeUpsert(item)
                        );
                    });

                    return { refetch: false };
                },

                // ------------------------------------
                //           UPDATE HANDLER
                // ------------------------------------
                onUpdate: async ({ transaction, collection }) => {
                    const localUpdatedKeys = transaction.mutations.map((m) =>
                        m.key
                    );
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

                    if (updateError) throw updateError;

                    const parsedServerUpdatedItems = serverUpdatedItems.map((
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

                    if (deleteError) throw deleteError;

                    collection.utils.writeBatch(() => {
                        localDeletedItemIds.forEach((id) =>
                            collection.utils.writeDelete(id)
                        );
                    });

                    return { refetch: false };
                },
            }),
        ) as Collection<TItem, string | number>;
    };

    return collectionCreator as any;
}

// --- 3. The Non-Parameterized Convenience Wrapper ---
export function createSupabaseCollection<
    TItem extends object,
    TInsert extends object,
    TUpdate extends object,
>(
    tableName: Table,
    schemas: SupabaseCollectionSchemas<TItem, TInsert, TUpdate>,
    config: FactoryConfig<TItem>,
): Collection<TItem, string | number> {
    // 1. Define the default queryFn to explicitly match Overload 2's required signature
    const defaultQueryFn = (async () => {
        const { data, error } = await supabase.from(tableName).select("*");
        if (error) throw error;
        return data.map((item) => schemas.rowSchema.parse(item));
    }) as (...params: []) => Promise<TItem[]>; // Enforce [] TParams

    // 2. We now explicitly call the parameterized factory with 4 arguments (matching Overload 2)
    return createParameterizedSupabaseCollectionFactory<
        TItem,
        TInsert,
        TUpdate
    >(
        tableName,
        schemas,
        defaultQueryFn, // Argument 3 (The required function for Overload 2)
        config, // Argument 4 (The config object)
    )(); // The function is immediately called with no arguments
}
