import { Database, Tables } from "@/db/supabase-types";

export type Table = keyof Database["public"]["Tables"];

export type TransformedRow<T> = {
    [K in keyof T]:
        // Check if the key ends with '_at' or '_date' AND the original type is string
        K extends `${string}_at` | `${string}_date`
            ? T[K] extends string ? Date : T[K] // If it matches and is a string, make it Date
            : T[K]; // Otherwise, keep the original type
};

export type Employee = TransformedRow<Tables<"employees">>;
export type EmployeeTitle = TransformedRow<Tables<"employee_titles">>;
export type Holiday = TransformedRow<Tables<"holidays">>;
export type HolidayDates = TransformedRow<Tables<"holiday_dates">>;
export type PayPeriod = TransformedRow<Tables<"pay_periods">>;
export type Permission = TransformedRow<Tables<"permissions">>;
export type StartingBalance = TransformedRow<Tables<"starting_balances">>;
export type TimeType = TransformedRow<Tables<"time_types">>;
export type Timesheet = TransformedRow<Tables<"timesheets">>;
export type TimesheetEmployee = TransformedRow<Tables<"timesheet_employees">>;
export type TimesheetEmployeeTime = TransformedRow<
    Tables<"timesheet_employee_times">
>;
export type Title = TransformedRow<Tables<"titles">>;
export type UserPermission = TransformedRow<Tables<"user_permissions">>;
