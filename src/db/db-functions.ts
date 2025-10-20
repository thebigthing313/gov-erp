import type { Insert, Row, Table, Update } from "@/lib/data-types";
import { supabase } from "@/main";

export async function dbSelect<T extends Table>(
    table: T,
): Promise<Row<T>[]> {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return (data ?? []) as unknown as Row<T>[];
}

export async function dbInsert<T extends Table>(
    table: T,
    items: Array<Insert<T>>,
): Promise<Row<T>[]> {
    const { data, error } = await supabase.from(table).insert(items as any)
        .select();
    if (error) throw error;
    return (data ?? []) as unknown as Row<T>[];
}

export async function dbUpdate<T extends Table>(
    table: T,
    items: Array<{ id: string; changes: Update<T> }>,
): Promise<Array<{ data: Row<T>[] | null; error: any }>> {
    const persistUpdate = async (
        { id, changes }: { id: string; changes: Update<T> },
    ) => {
        // This inner function should NOT throw, but rather return the {data, error} tuple.
        const { data, error } = await supabase.from(table)
            .update(changes as any)
            .eq("id", id as any)
            .select();

        return { data: (data ?? []) as unknown as Row<T>[], error };
    };

    // Use Promise.allSettled to wait for all, and extract the fulfillment value.
    const results = await Promise.allSettled(
        items.map((item) => persistUpdate(item)),
    );

    // Map the settled results to your desired array format {data, error}
    return results.map((result) => {
        if (result.status === "fulfilled") {
            // result.value is { data, error } from persistUpdate
            return {
                data: result.value.error ? null : result.value.data,
                error: result.value.error,
            };
        }
        // This handles cases where persistUpdate itself failed to execute (e.g., network down)
        return {
            data: null,
            error: result.reason,
        };
    });
}

export async function dbDelete(
    table: Table,
    keys: Array<string>,
) {
    const { error } = await supabase.from(table).delete().in("id", keys);
    if (error) throw error;
}
