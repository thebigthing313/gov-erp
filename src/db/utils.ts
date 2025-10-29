/**
 * @fileoverview Generic utility for serializing complex object keys into stable,
 * unique strings for use in JavaScript Maps, Sets, or cache keys.
 * * This is essential because standard Map.get() uses object reference,
 * not object value, for comparison.
 */

/**
 * Converts a generic object into a stable, deterministic string key.
 * * For reliable caching, this function sorts the object's keys alphabetically
 * before converting it to a JSON string. This ensures that objects with the
 * same properties and values, regardless of property order, produce the
 * same cache key.
 *
 * @param key The object to serialize (e.g., { year: 2024, employee_id: 'abc' }).
 * @returns A unique string key for the given object's value.
 */
export function serializeKey<T extends Record<string, unknown>>(
    key: T,
): string {
    // 1. Get all property names of the object
    const keys = Object.keys(key);

    // 2. Sort the keys alphabetically to ensure deterministic serialization
    keys.sort();

    // 3. Create a new object with sorted properties
    // FIX: Initialize with an index signature (Record<string, unknown>)
    // to allow dynamic string indexing within the loop.
    const sortedKeyObject: Record<string, unknown> = {};
    for (const k of keys) {
        // We use 'k as keyof T' because we know 'k' came from Object.keys(key)
        sortedKeyObject[k] = key[k as keyof T];
    }

    // 4. Stringify the sorted object to produce the stable, unique key
    return JSON.stringify(sortedKeyObject);
}

// --- Example Usage ---
/*
// Your MapKey type from the timesheet example
type MapKey = { year: number; employee_id: string };

const key1: MapKey = { employee_id: "e123", year: 2025 };
const key2: MapKey = { year: 2025, employee_id: "e123" };

const keyString1 = serializeKey(key1);
const keyString2 = serializeKey(key2);

// keyString1 and keyString2 will be identical: '{"employee_id":"e123","year":2025}'
// This can then be used safely in a Map.
*/
