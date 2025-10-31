import { Collection } from "@tanstack/react-db";
import { Table } from "../data-types";
import { createParameterizedSupabaseCollectionFactory } from "./collection-factory";
import { supabase } from "../client";
import {
    ZodEmployeeTitlesInsertToDb,
    ZodEmployeeTitlesInsertType,
    ZodEmployeeTitlesRow,
    ZodEmployeeTitlesRowType,
    ZodEmployeeTitlesUpdateToDb,
    ZodEmployeeTitlesUpdateType,
} from "../schemas/employee_titles";

const cache = new Map<
    string,
    Collection<ZodEmployeeTitlesRowType, string | number>
>();
const table: Table = "employee_titles";

const employeeTitlesCollectionFactory =
    createParameterizedSupabaseCollectionFactory<
        [employee_id: string],
        ZodEmployeeTitlesRowType,
        ZodEmployeeTitlesInsertType,
        ZodEmployeeTitlesUpdateType
    >(
        table,
        {
            rowSchema: ZodEmployeeTitlesRow,
            insertSchema: ZodEmployeeTitlesInsertToDb,
            updateSchema: ZodEmployeeTitlesUpdateToDb,
        },
        // Custom query function that uses the parameter
        async (
            employee_id,
        ) => {
            // This query fetches data filtered by the provided employee_id
            console.log(
                `Fetching employee_titles for employee_id: ${employee_id}`,
            );
            const { data, error } = await supabase
                .from(table)
                .select("*")
                .eq("employee_id", employee_id);

            if (error) throw error;

            const parsedData = data.map((item) =>
                ZodEmployeeTitlesRow.parse(item)
            );

            // Note: Zod parsing for transformation (DB string -> App Date)
            // will be handled by the factory's internal logic using EmployeeTitlesRowSchema.parse()
            return parsedData as ZodEmployeeTitlesRowType[];
        },
        // Configuration options (passed to the underlying useQuery hook)
        {
            staleTime: 1000 * 60 * 60, // 1 hour
        },
    );

// 2. Export the public function that manages caching and returns the collection
export const employee_titles = (employee_id: string) => {
    let collection = cache.get(employee_id);
    if (!collection) {
        // Create the collection instance by calling the factory result with the parameter
        collection = employeeTitlesCollectionFactory(employee_id);

        // Add cleanup logic to remove the collection from the cache when TanStack DB flags it
        collection.on("status:change", ({ status }) => {
            if (status === "cleaned-up") {
                cache.delete(employee_id);
            }
        });

        cache.set(
            employee_id,
            collection,
        );
    }
    return collection;
};
