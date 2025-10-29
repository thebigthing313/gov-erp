import { createSupabaseCollection } from "./collection-factory";
import {
    ZodTitlesInsertToDb,
    ZodTitlesInsertToDbType,
    ZodTitlesRow,
    ZodTitlesRowType,
    ZodTitlesUpdateToDb,
    ZodTitlesUpdateToDbType,
} from "../schemas/titles";

export const titles = createSupabaseCollection<
    ZodTitlesRowType,
    ZodTitlesInsertToDbType,
    ZodTitlesUpdateToDbType
>(
    "titles",
    {
        rowSchema: ZodTitlesRow,
        insertSchema: ZodTitlesInsertToDb,
        updateSchema: ZodTitlesUpdateToDb,
    },
    {
        staleTime: 1000 * 60 * 60,
    },
);
