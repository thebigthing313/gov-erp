import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { Row, Table } from "@/lib/data-types";
import { dbSelect } from "@/db/db-functions";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "./collection-functions";

const { queryClient } = TanstackQueryProvider.getContext();

export const DBWholeCollectionOptions = <T extends Table>(
    table: T,
    staleTime?: number,
) => queryCollectionOptions({
    queryKey: [table as string],
    queryFn: async () => {
        const data = await dbSelect(table);
        return data as unknown as Row<T>[];
    },
    staleTime,
    queryClient,
    getKey: (item) => item.id,
    onInsert: ({ transaction, collection }) =>
        collectionOnInsert(table, transaction, collection),
    onUpdate: ({ transaction, collection }) =>
        collectionOnUpdate(table, transaction, collection),
    onDelete: ({ transaction }) => collectionOnDelete(table, transaction),
});
