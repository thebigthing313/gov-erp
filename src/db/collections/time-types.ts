import { createSupabaseCollection } from "./collection-factory";
import {
    ZodTimeTypesInsertToDb,
    ZodTimeTypesInsertToDbType,
    ZodTimeTypesRow,
    ZodTimeTypesRowType,
    ZodTimeTypesUpdateToDb,
    ZodTimeTypesUpdateToDbType,
} from "../schemas/time_types";

export const TimeTypes = createSupabaseCollection<
    ZodTimeTypesRowType,
    ZodTimeTypesInsertToDbType,
    ZodTimeTypesUpdateToDbType
>(
    "time_types",
    {
        rowSchema: ZodTimeTypesRow,
        insertSchema: ZodTimeTypesInsertToDb,
        updateSchema: ZodTimeTypesUpdateToDb,
    },
    {
        staleTime: 1000 * 60 * 60,
    },
);
