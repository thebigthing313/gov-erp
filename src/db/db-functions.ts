import type { Table, TransformedRow } from "./data-types";
import { supabase } from "@/db/client";
import { transformDatesApptoDB, transformDatesDBtoApp } from "./utils";
import { Tables } from "./supabase-types";

/**
 * Fetches data from a Supabase table and transforms date strings to Date objects.
 * @returns A promise of an array of records with application-friendly Date types.
 */
export async function dbSelectAll<T extends Table>(
    table: T,
): Promise<Array<TransformedRow<Tables<T>>>> {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    const castedData = data as Array<Tables<T>>;

    return castedData.map(transformDatesDBtoApp);
}

/**
 * Inserts data into a Supabase table, converting Date objects to ISO strings on the way
 * and converting returned data back to Date objects.
 * @returns A promise of an array of the newly inserted records with application-friendly Date types.
 */
export async function dbInsert<T extends Table>(
    table: T,
    items: Array<Partial<TransformedRow<Tables<T>>>>,
): Promise<Array<TransformedRow<Tables<T>>>> {
    const itemsToInsert = items.map((item) => transformDatesApptoDB(item));

    const { data, error } = await supabase.from(table).insert(
        itemsToInsert as any,
    ).select("*");

    const castedData = data as Array<Tables<T>>;

    if (error) throw error;

    const transformedData = castedData.map(transformDatesDBtoApp);

    return transformedData as Array<TransformedRow<Tables<T>>>;
}

/**
 * Updates multiple items in a Supabase table. Handles both forward and reverse transformations.
 * @returns A promise of an array of results for each update operation.
 */
export async function dbUpdate<T extends Table>(
    table: T,
    items: Array<{ id: string; changes: Partial<TransformedRow<Tables<T>>> }>,
): Promise<Array<{ data: TransformedRow<Tables<T>> | null; error: any }>> {
    const persistUpdate = async (
        { id, changes }: {
            id: string;
            changes: Partial<TransformedRow<Tables<T>>>;
        },
    ) => {
        const changesToUpdate = transformDatesApptoDB(changes);

        const { data, error } = await supabase.from(table)
            .update(changesToUpdate as any)
            .eq("id", id as any)
            .select();

        if (error) {
            return { data: null, error };
        }

        const castedData = data as Array<Tables<T>>;

        const transformedData = castedData.map(transformDatesDBtoApp);

        return {
            data: transformedData as TransformedRow<Tables<T>>,
            error: null,
        };
    };

    // Use Promise.allSettled to ensure all updates complete without halting the entire process
    const results = await Promise.allSettled(
        items.map(persistUpdate),
    );

    // Map the settled results to the final desired array format {data, error}
    return results.map((result) => {
        if (result.status === "fulfilled") {
            // result.value is { data: AppRow<T>[], error: null } from persistUpdate
            return {
                data: result.value.error ? null : result.value.data,
                error: result.value.error,
            };
        }
        // This handles cases where persistUpdate failed to even execute (e.g., network error)
        return {
            data: null,
            error: result.reason,
        };
    });
}

/**
 * Deletes items from a Supabase table by ID.
 * @returns A promise that resolves upon successful deletion or throws on error.
 */
export async function dbDelete(
    table: Table,
    keys: Array<string>,
) {
    const { error } = await supabase.from(table).delete().in("id", keys);
    if (error) throw error;
}
