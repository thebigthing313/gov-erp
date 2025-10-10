import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

export type MCMECSupabaseClient = SupabaseClient<Database>;

export function createMCMECClient(
    supabaseUrl: string,
    anonKey: string,
): MCMECSupabaseClient {
    const supabase = createClient<Database>(supabaseUrl, anonKey);
    return supabase;
}
