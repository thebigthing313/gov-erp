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
): Promise<Row<T>[]> {
    const persistUpdate = async (
        { id, changes }: { id: string; changes: Update<T> },
    ) => {
        // include .select() so data is the returned rows
        const { data, error } = await supabase.from(table)
            .update(changes as any) // Cast to bypass Supabase's overly strict typing
            .eq("id", id as any)
            .select();
        if (error) throw error;
        return (data ?? []) as unknown as Row<T>[];
    };

    // await all updates and flatten the results into Row<T>[]
    const updates = await Promise.all(
        items.map(({ id, changes }) => persistUpdate({ id, changes })),
    );
    return updates.flat();
}

export async function dbDelete(
    table: Table,
    keys: Array<string>,
) {
    const { error } = await supabase.from(table).delete().in("id", keys);
    if (error) throw error;
}
