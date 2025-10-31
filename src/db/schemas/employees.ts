// Auto-generated schema file for employees table
// Generated on: 2025-10-31T16:53:50.077Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodEmployeesRow.parse(dataFromSupabase);

import z from "zod";
import { EmailSchema, PhoneNumberSchema } from "./fields";

export const ZodEmployeesRow = z.object({
    birth_date: z.preprocess(
        (val) =>
            typeof val === "string"
                ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`)
                : val,
        z.date(),
    ),
    cell_phone: PhoneNumberSchema.nullable(),
    created_at: z.preprocess(
        (val) => typeof val === "string" ? new Date(val) : val,
        z.date(),
    ).optional(),
    created_by: z.uuid().nullable().optional(),
    csc_number: z.string().nullable(),
    email_address: EmailSchema.nullable(),
    first_name: z.string(),
    home_address: z.string(),
    home_phone: PhoneNumberSchema.nullable(),
    id: z.uuid(),
    is_default_cto: z.boolean(),
    last_name: z.string(),
    mailing_address: z.string().nullable(),
    middle_name: z.string().nullable(),
    modified_at: z.preprocess(
        (val) => typeof val === "string" ? new Date(val) : val,
        z.date(),
    ).optional(),
    modified_by: z.uuid().nullable().optional(),
    pers_membership_number: z.string().nullable(),
    pers_tier: z.string().nullable(),
    photo_url: z.url().nullable(),
    ssn_hash: z.string(),
    user_id: z.uuid().nullable(),
});

export const ZodEmployeesInsert = z.object({
    birth_date: z.preprocess(
        (val) =>
            typeof val === "string"
                ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`)
                : val,
        z.date(),
    ),
    cell_phone: PhoneNumberSchema.nullable().optional(),
    csc_number: z.string().nullable().optional(),
    email_address: EmailSchema.nullable().optional(),
    first_name: z.string(),
    home_address: z.string(),
    home_phone: PhoneNumberSchema.nullable().optional(),
    id: z.uuid().optional(),
    is_default_cto: z.boolean().optional(),
    last_name: z.string(),
    mailing_address: z.string().nullable().optional(),
    middle_name: z.string().nullable().optional(),
    pers_membership_number: z.string().nullable().optional(),
    pers_tier: z.string().nullable().optional(),
    photo_url: z.url().nullable().optional(),
    ssn_hash: z.string(),
    user_id: z.uuid().nullable().optional(),
});

export const ZodEmployeesUpdate = ZodEmployeesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodEmployeesRowToDb = z.object({
    birth_date: z.preprocess(
        (val) => val instanceof Date ? val.toISOString().split("T")[0] : val,
        z.string(),
    ),
    cell_phone: PhoneNumberSchema.nullable(),
    created_at: z.preprocess(
        (val) => val instanceof Date ? val.toISOString() : val,
        z.string(),
    ).optional(),
    created_by: z.uuid().nullable().optional(),
    csc_number: z.string().nullable(),
    email_address: EmailSchema.nullable(),
    first_name: z.string(),
    home_address: z.string(),
    home_phone: PhoneNumberSchema.nullable(),
    id: z.uuid(),
    is_default_cto: z.boolean(),
    last_name: z.string(),
    mailing_address: z.string().nullable(),
    middle_name: z.string().nullable(),
    modified_at: z.preprocess(
        (val) => val instanceof Date ? val.toISOString() : val,
        z.string(),
    ).optional(),
    modified_by: z.uuid().nullable().optional(),
    pers_membership_number: z.string().nullable(),
    pers_tier: z.string().nullable(),
    photo_url: z.url().nullable(),
    ssn_hash: z.string(),
    user_id: z.uuid().nullable(),
});

export const ZodEmployeesInsertToDb = z.object({
    birth_date: z.preprocess(
        (val) => val instanceof Date ? val.toISOString().split("T")[0] : val,
        z.string(),
    ),
    cell_phone: PhoneNumberSchema.nullable().optional(),
    csc_number: z.string().nullable().optional(),
    email_address: EmailSchema.nullable().optional(),
    first_name: z.string(),
    home_address: z.string(),
    home_phone: PhoneNumberSchema.nullable().optional(),
    id: z.uuid().optional(),
    is_default_cto: z.boolean().optional(),
    last_name: z.string(),
    mailing_address: z.string().nullable().optional(),
    middle_name: z.string().nullable().optional(),
    pers_membership_number: z.string().nullable().optional(),
    pers_tier: z.string().nullable().optional(),
    photo_url: z.url().nullable().optional(),
    ssn_hash: z.string(),
    user_id: z.uuid().nullable().optional(),
});

export const ZodEmployeesUpdateToDb = ZodEmployeesInsertToDb.partial();

export type ZodEmployeesRowType = z.infer<typeof ZodEmployeesRow>;
export type ZodEmployeesInsertType = z.infer<typeof ZodEmployeesInsert>;
export type ZodEmployeesUpdateType = z.infer<typeof ZodEmployeesUpdate>;
export type ZodEmployeesRowToDbType = z.infer<typeof ZodEmployeesRowToDb>;
export type ZodEmployeesInsertToDbType = z.infer<typeof ZodEmployeesInsertToDb>;
export type ZodEmployeesUpdateToDbType = z.infer<typeof ZodEmployeesUpdateToDb>;
