import * as TanstackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { supabase } from "../client";

import {
    ZodEmployeesInsertToDb,
    ZodEmployeesRow,
    ZodEmployeesRowType,
    ZodEmployeesUpdateToDb,
} from "../schemas/employees";
import { toast } from "sonner";

const { queryClient } = TanstackQueryProvider.getContext();

export const employees = createCollection(
    queryCollectionOptions<ZodEmployeesRowType>({
        queryKey: ["employees"],
        queryFn: async () => {
            const { data, error } = await supabase.from("employees").select(
                "*",
            );
            if (error) throw error;
            const parsedData = data.map((item) => ZodEmployeesRow.parse(item));
            return parsedData;
        },
        queryClient,
        staleTime: 1000 * 60 * 120, // 2 hours
        getKey: (item) => item.id,
        onInsert: async ({ transaction, collection }) => {
            const localNewItems = transaction.mutations.map((m) => m.modified);
            const parsedLocalNewItems = localNewItems.map((item) =>
                ZodEmployeesInsertToDb.parse(item)
            );
            try {
                const { data: serverNewItems, error: insertError } =
                    await supabase.from("employees").insert(
                        parsedLocalNewItems,
                    ).select("*");

                if (insertError) throw insertError;

                const parsedServerNewItems = serverNewItems.map((item) =>
                    ZodEmployeesRow.parse(item)
                );
                collection.utils.writeBatch(() => {
                    parsedServerNewItems.forEach((item) =>
                        collection.utils.writeUpsert(item)
                    );
                });
            } catch (error) {
                toast.error("Server failed to create records.");
                throw error;
            }

            return { refetch: false };
        },
        onUpdate: async ({ transaction, collection }) => {
            const localUpdatedKeys = transaction.mutations.map((m) => m.key);
            const localChangesToApply = transaction.mutations[0].changes;

            const parsedChangesToApply = ZodEmployeesUpdateToDb.parse(
                localChangesToApply,
            );

            try {
                const { data: serverUpdatedItems, error: updateError } =
                    await supabase.from("employees").update(
                        parsedChangesToApply,
                    ).in("id", localUpdatedKeys).select("*");
                if (updateError) throw updateError;

                const parsedServerUpdatedItems = serverUpdatedItems.map((
                    item,
                ) => ZodEmployeesRow.parse(item));

                collection.utils.writeBatch(() => {
                    parsedServerUpdatedItems.forEach((item) =>
                        collection.utils.writeUpsert(item)
                    );
                });
            } catch (error) {
                toast.error("Server failed to update records.");
                throw error;
            }

            return { refetch: false };
        },
        onDelete: async ({ transaction, collection }) => {
            const localDeletedItemIds = transaction.mutations.map((m) => m.key);

            try {
                const { error: deleteError } = await supabase.from("employees")
                    .delete()
                    .in("id", localDeletedItemIds);
                if (deleteError) throw deleteError;

                collection.utils.writeBatch(() => {
                    localDeletedItemIds.forEach((id) =>
                        collection.utils.writeDelete(id)
                    );
                });
            } catch (error) {
                toast.error("Server failed to delete records.");
                throw error;
            }

            return { refetch: false };
        },
    }),
);
