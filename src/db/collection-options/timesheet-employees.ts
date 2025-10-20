import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { Table } from "@/lib/data-types";
import { supabase } from "@/main";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { dbDelete, dbInsert, dbUpdate } from "../db-functions";

const { queryClient } = TanstackQueryProvider.getContext();

const table: Table = "timesheet_employees";

export const TimesheetEmployeesByEmployeeYearCollectionOptions = (
    year: number,
    employee_id: string,
) => queryCollectionOptions({
    queryKey: [table, "year", year, "employee_id", employee_id],
    queryFn: async () => {
        const { data, error } = await supabase.from(table).select(
            "*, timesheets(pay_periods(payroll_year))",
        ).eq(
            "pay_periods.payroll_year",
            year,
        ).eq("employee_id", employee_id);
        if (error) throw error;
        return data;
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction, collection }) => {
        const localNewItems = transaction.mutations.map((m) => m.modified);
        const serverNewItems = await dbInsert(table, localNewItems);

        serverNewItems.forEach((item) => collection.utils.writeUpsert(item));
        return { refetch: false };
    },
    onUpdate: async ({ transaction, collection }) => {
        const localUpdatedItems = transaction.mutations.map((m) => ({
            id: m.key,
            changes: m.changes,
        }));
        const serverUpdatedItems = await dbUpdate(table, localUpdatedItems);

        serverUpdatedItems.forEach((item) => {
            collection.utils.writeUpsert(item);
        });
        return { refetch: false };
    },
    onDelete: async ({ transaction }) => {
        const localDeletedItemIds = transaction.mutations.map((m) => m.key);
        await dbDelete(table, localDeletedItemIds);
        return { refetch: false };
    },
});
