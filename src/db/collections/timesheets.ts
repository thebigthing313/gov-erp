import { createCollection } from "@tanstack/react-db";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { Table, Timesheet } from "../data-types";
import { supabase } from "../client";
import { Tables } from "../supabase-types";
import { transformDatesDBtoApp } from "../utils";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";

type CollectionType = ReturnType<typeof createCollection>;

const cache = new Map<number, CollectionType>();
const table: Table = "timesheets";

const { queryClient } = TanstackQueryProvider.getContext();

export const timesheets = (year: number) => {
    if (!cache.has(year)) {
        const collection = createCollection(queryCollectionOptions({
            queryKey: [table, "year", year],
            queryFn: async () => {
                const { data, error } = await supabase.from(table).select(
                    "*, pay_periods(payroll_year)",
                ).eq(
                    "pay_periods.payroll_year",
                    year,
                );
                if (error) throw error;

                const strippedData: Array<Tables<"timesheets">> = data.map(
                    (item) => {
                        const { pay_periods, ...rest } = item;
                        return rest;
                    },
                );

                const transformedData = strippedData.map(transformDatesDBtoApp);

                return transformedData as Array<Timesheet>;
            },
            queryClient,
            staleTime: 1000 * 60 * 30, // 5 minutes
            getKey: (item) => item.id,
            onInsert: async ({ transaction, collection }) =>
                await collectionOnInsert(table, transaction, collection),
            onUpdate: async ({ transaction, collection }) =>
                await collectionOnUpdate(table, transaction, collection),
            onDelete: async ({ transaction, collection }) =>
                await collectionOnDelete(table, transaction, collection),
        }));

        collection.on("status:change", ({ status }) => {
            if (status === "cleaned-up") {
                cache.delete(year);
            }
        });

        cache.set(
            year,
            collection as unknown as CollectionType,
        );
    }
    return cache.get(year)!;
};
