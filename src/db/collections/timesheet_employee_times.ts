import { Collection } from "@tanstack/react-db";
import { Table } from "../data-types";
import { supabase } from "../client";
import { serializeKey } from "../utils";
import {
    ZodTimesheetEmployeeTimesInsertToDb,
    ZodTimesheetEmployeeTimesInsertType,
    ZodTimesheetEmployeeTimesRow,
    ZodTimesheetEmployeeTimesRowType,
    ZodTimesheetEmployeeTimesUpdateType,
} from "../schemas/timesheet_employee_times";
import { createParameterizedSupabaseCollectionFactory } from "./collection-factory";
import { ZodTimesheetEmployeesUpdateToDb } from "../schemas/timesheet_employees";

type MapKey = { year: number; employee_id: string };

const cache = new Map<
    string,
    Collection<ZodTimesheetEmployeeTimesRowType, string | number>
>();

const table: Table = "timesheet_employee_times";

const timesheetEmployeeTimesCollectionFactory =
    createParameterizedSupabaseCollectionFactory<
        [year: number, employee_id: string],
        ZodTimesheetEmployeeTimesRowType,
        ZodTimesheetEmployeeTimesInsertType,
        ZodTimesheetEmployeeTimesUpdateType
    >(
        table,
        {
            rowSchema: ZodTimesheetEmployeeTimesRow,
            insertSchema: ZodTimesheetEmployeeTimesInsertToDb,
            updateSchema: ZodTimesheetEmployeesUpdateToDb,
        },
        async (year, employee_id) => {
            const { data, error } = await supabase.from(table).select(
                "*, timesheet_employees(timesheets(pay_periods(payroll_year)))",
            ).eq(
                "pay_periods.payroll_year",
                year,
            ).eq("employee_id", employee_id);
            if (error) throw error;
            const strippedData = data.map((item) => {
                const { timesheet_employees, ...rest } = item;
                return rest;
            });

            const parsedData = strippedData.map((item) =>
                ZodTimesheetEmployeeTimesRow.parse(item)
            );

            return parsedData as Array<ZodTimesheetEmployeeTimesRowType>;
        },
        { staleTime: 1000 * 60 * 30 },
    );

export const timesheet_employees = ({ year, employee_id }: MapKey) => {
    const key = serializeKey({ year, employee_id });
    let collection = cache.get(key);

    if (!collection) {
        collection = timesheetEmployeeTimesCollectionFactory(year, employee_id);

        collection.on("status:change", ({ status }) => {
            if (
                status ===
                    "cleaned-up"
            ) cache.delete(key);
        });
        cache.set(key, collection);
    }
    return collection;
};
