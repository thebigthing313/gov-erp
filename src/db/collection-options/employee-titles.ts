import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { AppRow, Table } from "@/lib/data-types";
import { supabase } from "@/db/client";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";
import { transformDates } from "../db-functions";

const { queryClient } = TanstackQueryProvider.getContext();

type EmployeeTitle = AppRow<"employee_titles">;
const table: Table = "employee_titles";

export const EmployeeTitlesByEmployeeIdCollectionOptions = (
    employee_id: string,
) => queryCollectionOptions({
    queryKey: [table, "employee_id", employee_id],
    queryFn: async () => {
        const { data, error } = await supabase.from(table).select("*")
            .eq("employee_id", employee_id);

        if (error) throw error;

        const transformedData = (data ?? []).map((item) =>
            transformDates(item)
        );

        return transformedData as unknown as Array<EmployeeTitle>;
    },
    queryClient,
    staleTime: 1000 * 60 * 60, // 1 hour
    getKey: (item) => item.id,
    onInsert: async ({ transaction, collection }) =>
        await collectionOnInsert(table, transaction, collection),
    onUpdate: async ({ transaction, collection }) =>
        await collectionOnUpdate(table, transaction, collection),
    onDelete: async ({ transaction }) =>
        await collectionOnDelete(table, transaction),
});
