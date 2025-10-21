import type { Database } from "../db/supabase-types";

export type Table = keyof Database["public"]["Tables"];
export type Row<T extends Table> = Database["public"]["Tables"][T]["Row"];
export type Insert<T extends Table> = Database["public"]["Tables"][T]["Insert"];
export type Update<T extends Table> = Database["public"]["Tables"][T]["Update"];

export type Enum = keyof Database["public"]["Enums"];
export type EnumValue<T extends Enum> = Database["public"]["Enums"][T];

type TransformedRow<T> = {
    [K in keyof T]:
        // Check if the key ends with '_at' or '_date' AND the original type is string
        K extends `${infer _P}_at` | `${infer _P}_date`
            ? T[K] extends string ? Date : T[K] // If it matches and is a string, make it Date
            : T[K]; // Otherwise, keep the original type
};

export type AppRow<T extends Table> = TransformedRow<Row<T>>;
