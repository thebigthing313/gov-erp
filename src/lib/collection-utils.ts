// Map to store the stable object reference using the serialized string key.
const canonicalKeyMap = new Map<string, object>();

/**
 * Generates a stable, unique string key from any number of primitive arguments.
 * @param args - An array of primitive values (number, string, boolean, null, undefined).
 * @returns A stable, unique string key.
 */
export const serializeKey = (...args: any[]): string => {
    return args
        .map((arg) => {
            if (typeof arg === "object" && arg !== null) {
                return String(arg);
            }
            return String(arg);
        })
        .join("::");
};

/**
 * Ensures a single, stable object reference for a variable number of parameters.
 * * @template T - The specific object type the caller expects the key to be
 * (e.g., { year: number, employee_id: string }).
 * @param args - The parameters (e.g., year, employee_id).
 * @returns The stable object reference, asserted to type T.
 */
export const getCanonicalKey = <T extends object>(
    ...args: (string | number | boolean | null | undefined)[]
): T => {
    const serializedKey = serializeKey(...args);

    if (!canonicalKeyMap.has(serializedKey)) {
        // Store an empty object, asserting it as type T for safety
        canonicalKeyMap.set(serializedKey, {} as T);
    }

    // Retrieve the reference, asserting the return type as T
    return canonicalKeyMap.get(serializedKey)! as T;
};
