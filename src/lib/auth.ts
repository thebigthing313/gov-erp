import { supabase } from "@/main";

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

export async function getAuth(): Promise<Auth | NoAuth> {
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

    const employeeId = jwt.claims.app_metadata.employee_id;
    if (!employeeId) return nullAuth; // Return NoAuth if no employeeId

    const auth = {
        userId: jwt.claims.sub,
        employeeId: employeeId,
        permissions: jwt.claims.app_metadata.permissions || [],
    };

    return auth;
}

export function hasPermission(auth: Auth, permission: Permission): boolean {
    return auth.permissions.includes(permission);
}

export function isAuthenticated(auth: Auth | NoAuth): boolean {
    return auth.userId != null && auth.employeeId != null;
}

export async function refreshSession(): Promise<void> {
    const { error } = await supabase.auth.refreshSession();
    if (error) throw error;
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
