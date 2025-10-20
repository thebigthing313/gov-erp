import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { Table } from "@/lib/data-types";
import { supabase } from "@/main";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";

const { queryClient } = TanstackQueryProvider.getContext();

const table: Table = "timesheets";

export const TimesheetsByYearCollectionOptions = (year: number) =>
    queryCollectionOptions({
        queryKey: [table, "year", year],
        queryFn: async () => {
            const { data, error } = await supabase.from(table).select(
                "*, pay_periods(payroll_year)",
            ).eq(
                "pay_periods.payroll_year",
                year,
            );
            if (error) throw error;
            const strippedData = data.map((item) => {
                const { pay_periods, ...rest } = item;
                return rest;
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
