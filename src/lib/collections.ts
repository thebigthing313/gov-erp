//// WONT BE IN FIRST RELEASE, THIS IS JUST TO TEST TANSTACK DB FEATURES ////
import * as SupabaseProvider from "@/integrations/supabase";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/query-core";
import type { Insert, Row, Table, Update } from "./data-types";
const queryClient = new QueryClient();
const supabase = SupabaseProvider.getContext().supabase;

async function genericSelect<T extends Table>(table: Table) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return data as Row<T>[];
}

async function genericInsert<T extends Table>(
    table: Table,
    items: Array<Insert<T>>,
) {
    const { error } = await supabase.from(table).insert(items);
    if (error) throw error;
}

async function genericUpdate<T extends Table>(
    table: Table,
    items: Array<{ id: string; changes: Update<T> }>,
) {
    const persistUpdate = async (
        { id, changes }: { id: string; changes: Update<T> },
    ) => {
        const { error } = await supabase.from(table).update(changes)
            .eq("id", id);
        if (error) throw error;
    };
    const updates = items.map(({ id, changes }) =>
        persistUpdate({ id, changes })
    );
    await Promise.all(updates);
}

async function genericDelete(
    table: Table,
    keys: Array<string>,
) {
    const { error } = await supabase.from(table).delete().in("id", keys);
    if (error) throw error;
}

const genericCreateCollection = (table: Table, staleTime?: number) => {
    return createCollection(queryCollectionOptions({
        queryKey: [table],
        queryFn: async () => {
            const data = await genericSelect(table);
            return data;
        },
        queryClient,
        getKey: (item) => item.id,
        staleTime: staleTime,
        onInsert: async ({ transaction }) => {
            const newItems = transaction.mutations.map((m) => m.modified);
            await genericInsert(table, newItems);
            return { refetch: false };
        },
        onUpdate: async ({ transaction }) => {
            const updatedItems = transaction.mutations.map((m) => ({
                id: m.key,
                changes: m.changes,
            }));
            await genericUpdate(table, updatedItems);
            return { refetch: false };
        },
        onDelete: async ({ transaction }) => {
            const deletedItemKeys = transaction.mutations.map((m) => m.key);
            await genericDelete(table, deletedItemKeys);
            return { refetch: false };
        },
    }));
};

export const employees = genericCreateCollection("employees", 1000 * 60 * 60); // 1 hour
export const titles = genericCreateCollection("titles", Infinity); // No expiration
export const time_types = genericCreateCollection("time_types", Infinity); // No expiration
