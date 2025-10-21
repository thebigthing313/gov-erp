import type { AppRow, Insert, Table, Update } from "@/lib/data-types";
import { supabase } from "@/db/client";

// ====================================================================
// FORWARD TRANSFORMATION (Read: string from DB -> Date for App)
// ====================================================================

/**
 * Transforms string dates/timestamps in a record into native JavaScript Date objects
 * based on the '_at' and '_date' naming conventions.
 * @param record The raw object returned from Supabase.
 * @returns The object with date fields converted to Date objects.
 */
export function transformDates<T>(record: T): T {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return record;
    }

    const newRecord = { ...record };

    for (const key in newRecord) {
        if (Object.prototype.hasOwnProperty.call(newRecord, key)) {
            const value = newRecord[key];

            // 1. Check for string value and naming convention
            if (
                typeof value === "string" &&
                (key.endsWith("_at") || key.endsWith("_date"))
            ) {
                const date = new Date(value);

                // 2. Check if the string successfully parsed into a valid Date
                if (!isNaN(date.getTime())) {
                    // @ts-ignore - TS ignores the potential string assignment error here
                    newRecord[key] = date;
                }
            }
        }
    }

    // Returns the record with Date objects, asserted as the input type T
    return newRecord as T;
}

// ====================================================================
// REVERSE TRANSFORMATION (Write: Date from App -> string for DB)
// ====================================================================

/**
 * Transforms native JavaScript Date objects in a record back into ISO 8601 strings
 * for insertion or update in the Supabase API.
 * @param record The object from the application (potentially with Date objects).
 * @returns The object with Date fields converted to ISO strings.
 */
export function transformDatesToStrings<T>(record: T): T {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return record;
    }

    const newRecord = { ...record };

    for (const key in newRecord) {
        if (Object.prototype.hasOwnProperty.call(newRecord, key)) {
            const value = newRecord[key];

            // Check if the value is a native Date object
            if (value instanceof Date) {
                // @ts-ignore - TS ignores the potential Date assignment error here
                newRecord[key] = value.toISOString();
            }
        }
    }

    // Returns the record with string dates, asserted as the input type T
    return newRecord as T;
}

// ====================================================================
// DATABASE API FUNCTIONS
// ====================================================================

/**
 * Fetches data from a Supabase table and transforms date strings to Date objects.
 * @returns A promise of an array of records with application-friendly Date types.
 */
export async function dbSelect<T extends Table>(
    table: T,
    query: string = "*",
): Promise<AppRow<T>[]> {
    const { data, error } = await supabase.from(table).select(query);
    if (error) throw error;

    // FORWARD transformation: string -> Date
    const transformedData = (data ?? []).map((item) => transformDates(item));

    // Assert to the correct AppRow type (with Date objects)
    return transformedData as AppRow<T>[];
}

/**
 * Inserts data into a Supabase table, converting Date objects to ISO strings on the way
 * and converting returned data back to Date objects.
 * @returns A promise of an array of the newly inserted records with application-friendly Date types.
 */
export async function dbInsert<T extends Table>(
    table: T,
    items: Array<Insert<T>>,
): Promise<AppRow<T>[]> {
    // REVERSE transformation: Date -> string for API submission
    const itemsToInsert = items.map((item) => transformDatesToStrings(item));

    const { data, error } = await supabase.from(table).insert(
        itemsToInsert as any,
    ).select();
    if (error) throw error;

    // FORWARD transformation: string -> Date for application consumption
    const transformedData = (data ?? []).map((item) => transformDates(item));

    // Assert to the correct AppRow type (with Date objects)
    return transformedData as AppRow<T>[];
}

/**
 * Updates multiple items in a Supabase table. Handles both forward and reverse transformations.
 * @returns A promise of an array of results for each update operation.
 */
export async function dbUpdate<T extends Table>(
    table: T,
    items: Array<{ id: string; changes: Update<T> }>,
): Promise<Array<{ data: AppRow<T>[] | null; error: any }>> {
    const persistUpdate = async (
        { id, changes }: { id: string; changes: Update<T> },
    ) => {
        // REVERSE transformation: Convert incoming Date objects to ISO strings
        const changesToUpdate = transformDatesToStrings(changes);

        const { data, error } = await supabase.from(table)
            .update(changesToUpdate as any)
            .eq("id", id as any)
            .select();

        if (error) {
            return { data: null, error };
        }

        // FORWARD transformation: Convert returned ISO strings to Date objects
        const transformedData = (data ?? []).map((item) =>
            transformDates(item)
        );

        // Return the correctly typed, transformed data
        return { data: transformedData as AppRow<T>[], error: null };
    };

    // Use Promise.allSettled to ensure all updates complete without halting the entire process
    const results = await Promise.allSettled(
        items.map((item) => persistUpdate(item)),
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
