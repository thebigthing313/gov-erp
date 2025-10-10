import type { MCMECSupabaseClient } from "./supabase";

export type Permission =
    | "manage_permissions"
    | "hr_functions"
    | "timesheet_functions"
    | "admin";

export async function getUserId(
    supabase: MCMECSupabaseClient,
): Promise<string | null> {
    const { data, error } = await supabase.auth.getClaims();

    if (error) throw error;
    if (!data) return null;

    const userId = data.claims.sub;

    return userId;
}

export async function getProfileId(
    supabase: MCMECSupabaseClient,
): Promise<string | null> {
    const { data, error } = await supabase.auth.getClaims();

    if (error) throw error;
    if (!data) return null;

    const profileId = data.claims.app_metadata?.profile_id || null;

    return profileId;
}

export async function getPermissions(
    supabase: MCMECSupabaseClient,
): Promise<(Permission | string)[]> {
    const { data, error } = await supabase.auth.getClaims();

    if (error) throw error;
    if (!data) return [];
    const permissions = data.claims.app_metadata?.permissions || [];
    return permissions;
}

export function hasPermission(
    permissions: (Permission | string)[],
    check: Permission,
): boolean {
    return permissions.includes(check);
}

export async function sessionExists(
    supabase: MCMECSupabaseClient,
): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!data;
}
