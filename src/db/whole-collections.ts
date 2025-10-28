import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { Table } from "./data-types";
import { dbSelectAll } from "@/db/db-functions";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "./collection-functions";
import { TransformedRow } from "./data-types";
import { Tables } from "./supabase-types";

const { queryClient } = TanstackQueryProvider.getContext();

export const DBWholeCollectionOptions = <T extends Table>(
    table: T,
    staleTime?: number,
) => queryCollectionOptions({
    queryKey: [table as string],
    queryFn: async () => {
        const data = await dbSelectAll(table);
        return data as Array<TransformedRow<Tables<T>>>;
    },
    staleTime,
    queryClient,
    getKey: (item) => item.id,
    onInsert: ({ transaction, collection }) =>
        collectionOnInsert(table, transaction, collection),
    onUpdate: ({ transaction, collection }) =>
        collectionOnUpdate(table, transaction, collection),
    onDelete: ({ transaction, collection }) =>
        collectionOnDelete(table, transaction, collection),
});
