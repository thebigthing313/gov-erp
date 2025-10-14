import type { MCMECSupabaseClient } from "./supabase";

export type Permission =
    | "manage_permissions"
    | "hr_functions"
    | "timesheet_functions"
    | "admin";

export type Auth = {
    userId: string;
    employeeId: string;
    permissions: (Permission | string)[];
};

export type NoAuth = {
    userId: null;
    employeeId: null;
    permissions: [];
};

export async function getAuth(
    supabase: MCMECSupabaseClient,
): Promise<Auth | NoAuth> {
    const nullAuth: NoAuth = {
        userId: null,
        employeeId: null,
        permissions: [],
    };

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) return nullAuth;

    const { data: jwt, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError) throw claimsError;
    if (!jwt) return nullAuth;

    const auth = {
        userId: jwt.claims.sub,
        employeeId: jwt.claims.employee_id,
        permissions: jwt.claims.permissions || [],
    };

    return auth;
}

export function hasPermission(auth: Auth, permission: Permission): boolean {
    return auth.permissions.includes(permission);
}

export function isAuthenticated(auth: Auth | NoAuth): boolean {
    return auth.userId !== null && auth.employeeId !== null;
}

export async function refreshSession(
    supabase: MCMECSupabaseClient,
): Promise<void> {
    const { error } = await supabase.auth.refreshSession();
    if (error) throw error;
}
