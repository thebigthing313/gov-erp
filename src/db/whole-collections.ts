import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { Table } from "@/lib/data-types";
import { dbDelete, dbInsert, dbSelect, dbUpdate } from "@/db/db-functions";
import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";

const { queryClient } = TanstackQueryProvider.getContext();

export const DBWholeCollectionOptions = (table: Table, staleTime?: number) =>
    queryCollectionOptions({
        queryKey: [table as string],
        queryFn: async () => {
            const data = await dbSelect(table);
            return data;
        },
        staleTime,
        queryClient,
        getKey: (item) => item.id,
        onInsert: async ({ transaction, collection }) => {
            const localNewItems = transaction.mutations.map((m) => m.modified);
            const serverNewItems = await dbInsert(table, localNewItems);

            serverNewItems.forEach((item) =>
                collection.utils.writeUpsert(item)
            );
            return { refetch: false };
        },
        onUpdate: async ({ transaction, collection }) => {
            const localUpdatedItems = transaction.mutations.map((m) => ({
                id: m.key,
                changes: m.changes,
            }));
            const serverUpdatedItems = await dbUpdate(table, localUpdatedItems);

            serverUpdatedItems.forEach((item) => {
                collection.utils.writeUpsert(item);
            });
            return { refetch: false };
        },
        onDelete: async ({ transaction }) => {
            const localDeletedItemIds = transaction.mutations.map((m) => m.key);
            await dbDelete(table, localDeletedItemIds);
            return { refetch: false };
        },
    });
