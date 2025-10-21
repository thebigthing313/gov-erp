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

type TimesheetEmployee = Row<"timesheet_employees">;
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
        const strippedData = data.map((item) => {
            const { timesheets, ...rest } = item;
            return rest as TimesheetEmployee;
        });
        return strippedData;
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: ({ transaction, collection }) =>
        collectionOnInsert(table, transaction, collection),
    onUpdate: ({ transaction, collection }) =>
        collectionOnUpdate(table, transaction, collection),
    onDelete: ({ transaction }) => collectionOnDelete(table, transaction),
});
