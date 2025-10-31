import { createSupabaseCollection } from "./collection-factory";
import {
    ZodPayPeriodsInsertToDb,
    ZodPayPeriodsInsertToDbType,
    ZodPayPeriodsRow,
    ZodPayPeriodsRowType,
    ZodPayPeriodsUpdateToDb,
    ZodPayPeriodsUpdateToDbType,
} from "../schemas/pay_periods";

export const pay_periods = createSupabaseCollection<
    ZodPayPeriodsRowType,
    ZodPayPeriodsInsertToDbType,
    ZodPayPeriodsUpdateToDbType
>(
    "pay_periods",
    {
        rowSchema: ZodPayPeriodsRow,
        insertSchema: ZodPayPeriodsInsertToDb,
        updateSchema: ZodPayPeriodsUpdateToDb,
    },
    {
        staleTime: Infinity,
    },
);
