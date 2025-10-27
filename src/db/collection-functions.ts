import { Collection, TransactionWithMutations } from "@tanstack/react-db";
import { dbDelete, dbInsert, dbUpdate } from "./db-functions";
import { Table } from "@/lib/data-types";
import { toast } from "sonner";

export async function collectionOnDelete(
    table: Table,
    transaction: TransactionWithMutations<any>,
    collection: Collection<any, any, any, any, any>,
) {
    const localDeletedItemIds = transaction.mutations.map((m) => m.key);

    try {
        await dbDelete(table, localDeletedItemIds);
        localDeletedItemIds.forEach((id) => collection.utils.writeDelete(id));
    } catch (error) {
        toast.error("Failed to delete records.");
        throw error; // rethrow so tanstack db rolls back optimistic changes
    }

    return { refetch: false };
}

export async function collectionOnInsert(
    table: Table,
    transaction: TransactionWithMutations<any>,
    collection: Collection<any, any, any, any, any>,
) {
    const localNewItems = transaction.mutations.map((m) => m.modified);
    try {
        const serverNewItems = await dbInsert(table, localNewItems);
        serverNewItems.forEach((item) => collection.utils.writeUpsert(item));
    } catch (error) {
        toast.error("Failed to create records.");
        throw error; // rethrow so tanstack db rolls back optimistic changes
    }

    return { refetch: false };
}

export async function collectionOnUpdate(
    table: Table,
    transaction: TransactionWithMutations<any>,
    collection: Collection<any, any, any, any, any>,
) {
    const localUpdatedItems = transaction.mutations.map((m) => ({
        id: m.key,
        changes: m.changes,
    }));

    // 1. Get the structured results from the server
    const serverResponses = await dbUpdate(table, localUpdatedItems);

    let hasFailure = false;

    // 2. Iterate through responses to perform granular commit/rollback
    serverResponses.forEach((response, index) => {
        const mutation = transaction.mutations[index];

        if (response.error) {
            hasFailure = true;
            console.error(
                `Update failed for ID ${mutation.key}:`,
                response.error,
            );

            // Granular Rollback: Upsert the original (pre-optimistic) data.
            collection.utils.writeUpsert(mutation.original);
        } else if (response.data && response.data.length > 0) {
            // response.data is an array (from .select()), but should contain one row for an update
            collection.utils.writeUpsert(response.data[0]);
        }
    });
    if (hasFailure) {
        toast.error("Some updates failed. Changes have been rolled back.");
    }

    return { refetch: false };
}
