import { Table, TransformedRow } from "./data-types";
import { Tables } from "./supabase-types";

export function transformDatesDBtoApp<T extends Table>(
    record: Tables<T>,
): TransformedRow<Tables<T>> {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return record as TransformedRow<Tables<T>>;
    }

    const newRecord = { ...record };

    for (const key in newRecord) {
        if (Object.prototype.hasOwnProperty.call(newRecord, key)) {
            const value = newRecord[key];

            if (typeof value === "string") {
                let date: Date | null = null;

                if (key.endsWith("_date")) { // --- Date-Only Fields ---
                    // Force UTC interpretation by appending the time/zone indicator.
                    date = new Date(`${value}T00:00:00.000Z`);
                } else if (key.endsWith("_at")) { // --- Timestamp Fields ---
                    // Timestamps are already UTC from Postgres, so use them directly.
                    date = new Date(value);
                }

                if (date && !isNaN(date.getTime())) {
                    // @ts-ignore
                    newRecord[key] = date;
                }
            }
        }
    }

    // Returns the record with Date objects, asserted as TransformedRow<T>
    return newRecord as TransformedRow<Tables<T>>;
}

export function transformDatesApptoDB<T extends Table>(
    record: Partial<TransformedRow<Tables<T>>>,
): Partial<Tables<T>> {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return record as Partial<Tables<T>>;
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
    return newRecord as Partial<Tables<T>>;
}
