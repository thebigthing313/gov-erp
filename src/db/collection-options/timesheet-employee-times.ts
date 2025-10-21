import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { Row, Table } from "@/lib/data-types";
import { supabase } from "@/db/client";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";

const { queryClient } = TanstackQueryProvider.getContext();

type TimesheetEmployeeTime = Row<"timesheet_employee_times">;
const table: Table = "timesheet_employee_times";

export const TimesheetEmployeeTimesByEmployeeYearCollectionOptions = (
    year: number,
    employee_id: string,
) => queryCollectionOptions<TimesheetEmployeeTime>({
    queryKey: [table, "year", year, "employee_id", employee_id],
    queryFn: async () => {
        const { data, error } = await supabase.from(table).select(
            "*, timesheet_employees(timesheets(pay_periods(payroll_year)))",
        ).eq(
            "pay_periods.payroll_year",
            year,
        ).eq("employee_id", employee_id);
        if (error) throw error;
        const strippedData = data.map((item) => {
            const { timesheet_employees, ...rest } = item;
            return rest as TimesheetEmployeeTime;
        });

        return strippedData;
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction, collection }) =>
        await collectionOnInsert(table, transaction, collection),
    onUpdate: async ({ transaction, collection }) =>
        await collectionOnUpdate(table, transaction, collection),
    onDelete: async ({ transaction }) =>
        await collectionOnDelete(table, transaction),
});
