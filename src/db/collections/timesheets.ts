// import { createCollection } from "@tanstack/react-db";
// import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
// import { queryCollectionOptions } from "@tanstack/query-db-collection";
// import { Table, Timesheet } from "../data-types";
// import { supabase } from "../client";
// import { Tables } from "../supabase-types";
// import { transformDatesDBtoApp } from "../utils";
// import {
//     collectionOnDelete,
//     collectionOnInsert,
//     collectionOnUpdate,
// } from "../collection-functions";

import { Collection } from "@tanstack/react-db";
import {
    ZodTimesheetsInsertToDb,
    ZodTimesheetsInsertType,
    ZodTimesheetsRow,
    ZodTimesheetsRowType,
    ZodTimesheetsUpdateToDb,
    ZodTimesheetsUpdateType,
} from "../schemas/timesheets";
import { Table } from "../data-types";
import { createParameterizedSupabaseCollectionFactory } from "./collection-factory";
import { supabase } from "../client";

// type CollectionType = ReturnType<typeof createCollection>;

// const cache = new Map<number, CollectionType>();
// const table: Table = "timesheets";

// const { queryClient } = TanstackQueryProvider.getContext();

// export const timesheets = (year: number) => {
//     if (!cache.has(year)) {
//         const collection = createCollection(queryCollectionOptions({
//             queryKey: [table, "year", year],
//             queryFn: async () => {
//                 const { data, error } = await supabase.from(table).select(
//                     "*, pay_periods(payroll_year)",
//                 ).eq(
//                     "pay_periods.payroll_year",
//                     year,
//                 );
//                 if (error) throw error;

//                 const strippedData: Array<Tables<"timesheets">> = data.map(
//                     (item) => {
//                         const { pay_periods, ...rest } = item;
//                         return rest;
//                     },
//                 );

//                 const transformedData = strippedData.map(transformDatesDBtoApp);

//                 return transformedData as Array<Timesheet>;
//             },
//             queryClient,
//             staleTime: 1000 * 60 * 10, // 10 minutes
//             getKey: (item) => item.id,
//             onInsert: async ({ transaction, collection }) =>
//                 await collectionOnInsert(table, transaction, collection),
//             onUpdate: async ({ transaction, collection }) =>
//                 await collectionOnUpdate(table, transaction, collection),
//             onDelete: async ({ transaction, collection }) =>
//                 await collectionOnDelete(table, transaction, collection),
//         }));

//         collection.on("status:change", ({ status }) => {
//             if (status === "cleaned-up") {
//                 cache.delete(year);
//             }
//         });

//         cache.set(
//             year,
//             collection as unknown as CollectionType,
//         );
//     }
//     return cache.get(year)!;
// };

const cache = new Map<
    number,
    Collection<ZodTimesheetsRowType, string | number>
>();
const table: Table = "timesheets";

const timesheetsCollectionFactory =
    createParameterizedSupabaseCollectionFactory<
        [year: number],
        ZodTimesheetsRowType,
        ZodTimesheetsInsertType,
        ZodTimesheetsUpdateType
    >(
        table,
        {
            rowSchema: ZodTimesheetsRow,
            insertSchema: ZodTimesheetsInsertToDb,
            updateSchema: ZodTimesheetsUpdateToDb,
        },
        async (year) => {
            const { data, error } = await supabase.from(table).select(
                "*, pay_periods(payroll_year)",
            ).eq(
                "pay_periods.payroll_year",
                year,
            );
            if (error) throw error;

            const strippedData = data.map(
                (item) => {
                    const { pay_periods, ...rest } = item;
                    return rest;
                },
            );

            const parsedData = strippedData.map((item) =>
                ZodTimesheetsRow.parse(item)
            );

            return parsedData as Array<ZodTimesheetsRowType>;
        },
        {
            staleTime: 1000 * 60 * 60, // 1 hour
        },
    );

export const timesheets = (year: number) => {
    let collection = cache.get(year);
    if (!collection) {
        collection = timesheetsCollectionFactory(year);
        collection.on("status:change", ({ status }) => {
            if (status === "cleaned-up") {
                cache.delete(year);
            }
        });

        cache.set(year, collection);
    }
    return collection;
};
