import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types";

export type MCMECSupabaseClient = SupabaseClient<Database>;

function createMCMECClient(
    supabaseUrl: string,
    anonKey: string,
): MCMECSupabaseClient {
    const supabase = createClient<Database>(supabaseUrl, anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
        },
    });
    return supabase;
}

export const supabase = createMCMECClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
