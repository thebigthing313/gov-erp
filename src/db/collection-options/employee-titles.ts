import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { Row, Table } from "@/lib/data-types";
import { supabase } from "@/main";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";

const { queryClient } = TanstackQueryProvider.getContext();

type EmployeeTitle = Row<"employee_titles">;
const table: Table = "employee_titles";

export const EmployeeTitlesByEmployeeIdCollectionOptions = (
    employee_id: string,
) => queryCollectionOptions({
    queryKey: [table, "employee_id", employee_id],
    queryFn: async () => {
        const { data, error } = await supabase.from(table).select("*")
            .eq("employee_id", employee_id);
        if (error) throw error;
        return data as Array<EmployeeTitle>;
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
