import { createSupabaseCollection } from "./collection-factory";
import {
    ZodHolidayDatesInsertToDb,
    ZodHolidayDatesInsertToDbType,
    ZodHolidayDatesRow,
    ZodHolidayDatesRowType,
    ZodHolidayDatesUpdateToDb,
    ZodHolidayDatesUpdateToDbType,
} from "../schemas/holiday_dates";

export const holiday_dates = createSupabaseCollection<
    ZodHolidayDatesRowType,
    ZodHolidayDatesInsertToDbType,
    ZodHolidayDatesUpdateToDbType
>(
    "holiday_dates",
    {
        rowSchema: ZodHolidayDatesRow,
        insertSchema: ZodHolidayDatesInsertToDb,
        updateSchema: ZodHolidayDatesUpdateToDb,
    },
    {
        staleTime: Infinity,
    },
);
