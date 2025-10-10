import type { Database } from "./supabase-types";

export type Table = keyof Database["public"]["Tables"];
export type Row<T extends Table> = Database["public"]["Tables"][T]["Row"];
export type Insert<T extends Table> = Database["public"]["Tables"][T]["Insert"];
export type Update<T extends Table> = Database["public"]["Tables"][T]["Update"];

export type Enum = keyof Database["public"]["Enums"];
export type EnumValue<T extends Enum> = Database["public"]["Enums"][T];
