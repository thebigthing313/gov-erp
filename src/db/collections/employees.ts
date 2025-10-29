import { createSupabaseCollection } from "./collection-factory";
import {
    ZodEmployeesInsertToDb,
    ZodEmployeesInsertToDbType,
    ZodEmployeesRow,
    ZodEmployeesRowType,
    ZodEmployeesUpdateToDb,
    ZodEmployeesUpdateToDbType,
} from "../schemas/employees";

export const employees = createSupabaseCollection<
    ZodEmployeesRowType,
    ZodEmployeesInsertToDbType,
    ZodEmployeesUpdateToDbType
>(
    "employees",
    {
        rowSchema: ZodEmployeesRow,
        insertSchema: ZodEmployeesInsertToDb,
        updateSchema: ZodEmployeesUpdateToDb,
    },
    {
        staleTime: 1000 * 60 * 60,
    },
);
