import { createCollection } from "@tanstack/react-db";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { Table, TimesheetEmployeeTime } from "../data-types";
import { supabase } from "../client";
import { transformDatesDBtoApp } from "../utils";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";

type CollectionType = ReturnType<typeof createCollection>;

type MapKey = { year: number; employee_id: string };

const cache = new Map<MapKey, CollectionType>();
const table: Table = "timesheet_employee_times";

const { queryClient } = TanstackQueryProvider.getContext();

export const timesheet_employees = ({ year, employee_id }: MapKey) => {
    if (!cache.has({ year, employee_id })) {
        const collection = createCollection(
            queryCollectionOptions<TimesheetEmployeeTime>({
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
                        return rest;
                    });

                    const transformedData = strippedData.map(
                        transformDatesDBtoApp,
                    );

                    return transformedData as Array<
                        TimesheetEmployeeTime
                    >;
                },
                queryClient,
                getKey: (item) => item.id,
                onInsert: async ({ transaction, collection }) =>
                    await collectionOnInsert(table, transaction, collection),
                onUpdate: async ({ transaction, collection }) =>
                    await collectionOnUpdate(table, transaction, collection),
                onDelete: async ({ transaction, collection }) =>
                    await collectionOnDelete(table, transaction, collection),
            }),
        );

        collection.on("status:change", ({ status }) => {
            if (status === "cleaned-up") {
                cache.delete({ year, employee_id });
            }
        });

        cache.set(
            { year, employee_id },
            collection as unknown as CollectionType,
        );
    }
    return cache.get({ year, employee_id })!;
};
