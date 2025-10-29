import { createCollection } from "@tanstack/react-db";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { EmployeeTitle, Table } from "../data-types";
import { supabase } from "../client";
import { transformDatesDBtoApp } from "../utils";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";

type CollectionType = ReturnType<typeof createCollection>;

const cache = new Map<string, CollectionType>();
const table: Table = "employee_titles";

const { queryClient } = TanstackQueryProvider.getContext();

export const employee_titles = (employee_id: string) => {
    if (!cache.has(employee_id)) {
        const collection = createCollection(queryCollectionOptions({
            queryKey: [table, "employee_id", employee_id],
            queryFn: async () => {
                const { data, error } = await supabase.from(table).select("*")
                    .eq("employee_id", employee_id);

                if (error) throw error;

                const transformedData = data.map(transformDatesDBtoApp);

                return transformedData as unknown as Array<EmployeeTitle>;
            },
            queryClient,
            staleTime: 1000 * 60 * 60, // 1 hour
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
                cache.delete(employee_id);
            }
        });

        cache.set(
            employee_id,
            collection as unknown as CollectionType,
        );
    }
    return cache.get(employee_id)!;
};
