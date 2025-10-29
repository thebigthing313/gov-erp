import { Collection } from "@tanstack/react-db";
import { Table } from "../data-types";
import { createParameterizedSupabaseCollectionFactory } from "./collection-factory";
import { supabase } from "../client";
import {
    ZodTimesheetEmployeesInsertToDb,
    ZodTimesheetEmployeesInsertType,
    ZodTimesheetEmployeesRow,
    ZodTimesheetEmployeesRowType,
    ZodTimesheetEmployeesUpdateToDb,
    ZodTimesheetEmployeesUpdateType,
} from "../schemas/timesheet_employees";
import { serializeKey } from "../utils";

// Defines the composite key structure used in the public function signature
type MapKey = { year: number; employee_id: string };

// Local cache uses the serialized string as its key
const cache = new Map<
    string,
    Collection<ZodTimesheetEmployeesRowType, string | number>
>();
const table: Table = "timesheet_employees";

// 1. Create the factory function for the timesheet_employees table
const timesheetEmployeesCollectionFactory =
    createParameterizedSupabaseCollectionFactory<
        [year: number, employee_id: string], // TParams: The required parameter
        ZodTimesheetEmployeesRowType,
        ZodTimesheetEmployeesInsertType,
        ZodTimesheetEmployeesUpdateType
    >(
        table,
        {
            rowSchema: ZodTimesheetEmployeesRow,
            insertSchema: ZodTimesheetEmployeesInsertToDb,
            updateSchema: ZodTimesheetEmployeesUpdateToDb,
        },
        // Custom query function that uses the parameter
        async (
            year,
            employee_id,
        ) => {
            const { data, error } = await supabase.from("timesheet_employees")
                .select(
                    "*, timesheets(pay_periods(payroll_year))",
                ).eq(
                    "pay_periods.payroll_year",
                    year,
                ).eq("employee_id", employee_id);
            if (error) throw error;

            const strippedData = data.map((item) => {
                const { timesheets, ...rest } = item;
                return rest;
            });

            const parsedData = strippedData.map((item) =>
                ZodTimesheetEmployeesRow.parse(item)
            );

            return parsedData as ZodTimesheetEmployeesRowType[];
        },
        // Configuration options (passed to the underlying useQuery hook)
        {
            staleTime: 1000 * 60 * 60, // 1 hour
        },
    );

// 2. Export the public function that manages caching and returns the collection
export const timesheet_employees = ({ year, employee_id }: MapKey) => {
    // Generate the deterministic string key
    const key = serializeKey({ year, employee_id });

    let collection = cache.get(key);

    if (!collection) {
        // Create the collection instance by calling the factory result with the parameters
        collection = timesheetEmployeesCollectionFactory(year, employee_id);

        // Add cleanup logic to remove the collection from the cache when TanStack DB flags it
        collection.on("status:change", ({ status }) => {
            if (status === "cleaned-up") {
                // Ensure the cleanup logic uses the correct serialized key
                cache.delete(key);
            }
        });

        cache.set(
            key, // Set using the serialized string key
            collection,
        );
    }
    return collection;
};
