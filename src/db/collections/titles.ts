import { createSupabaseCollection } from "./collection-factory";
import {
    ZodTitlesInsertToDb,
    ZodTitlesInsertToDbType,
    ZodTitlesRow,
    ZodTitlesRowType,
    ZodTitlesUpdateToDb,
    ZodTitlesUpdateToDbType,
} from "../schemas/titles";

// NOTE: Using the Zod objects directly for the schemas and inferring the types for generics.
// Assuming ZodTitlesInsertToDbType and ZodTitlesUpdateToDbType are correctly inferred types
// (i.e., z.infer<typeof ZodTitlesInsertToDb>)

export const titles = createSupabaseCollection<
    ZodTitlesRowType,
    ZodTitlesInsertToDbType,
    ZodTitlesUpdateToDbType
>(
    "titles", // Using Table enum for safety, assuming 'titles' is a member
    {
        rowSchema: ZodTitlesRow,
        insertSchema: ZodTitlesInsertToDb,
        updateSchema: ZodTitlesUpdateToDb,
    },
    {
        // This is the config object (for TanStack Query)
        staleTime: 1000 * 60 * 60, // 1 hour
    },
);
