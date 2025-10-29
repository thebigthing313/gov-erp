import { createSupabaseCollection } from "./collection-factory";
import {
    ZodHolidaysInsertToDb,
    ZodHolidaysInsertToDbType,
    ZodHolidaysRow,
    ZodHolidaysRowType,
    ZodHolidaysUpdateToDb,
    ZodHolidaysUpdateToDbType,
} from "../schemas/holidays";

export const holidays = createSupabaseCollection<
    ZodHolidaysRowType,
    ZodHolidaysInsertToDbType,
    ZodHolidaysUpdateToDbType
>(
    "holidays",
    {
        rowSchema: ZodHolidaysRow,
        insertSchema: ZodHolidaysInsertToDb,
        updateSchema: ZodHolidaysUpdateToDb,
    },
    {
        staleTime: Infinity,
    },
);
