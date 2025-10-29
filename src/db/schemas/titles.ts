// Auto-generated schema file for titles table
// Generated on: 2025-10-29T21:27:48.423Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodTitlesRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodTitlesRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	csc_code: z.string(),
	csc_description_url: z.url().nullable(),
	id: z.uuid(),
	is_clerical: z.boolean(),
	is_salaried: z.boolean(),
	maximum_annual_salary: z.number().nullable(),
	minimum_annual_salary: z.number().nullable(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	title_description_url: z.url().nullable(),
	title_name: z.string(),
});

export const ZodTitlesInsert = z.object({
	csc_code: z.string(),
	csc_description_url: z.url().nullable().optional(),
	id: z.uuid().optional(),
	is_clerical: z.boolean().optional(),
	is_salaried: z.boolean().optional(),
	maximum_annual_salary: z.number().nullable().optional(),
	minimum_annual_salary: z.number().nullable().optional(),
	title_description_url: z.url().nullable().optional(),
	title_name: z.string(),
});

export const ZodTitlesUpdate = ZodTitlesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodTitlesRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	csc_code: z.string(),
	csc_description_url: z.url().nullable(),
	id: z.uuid(),
	is_clerical: z.boolean(),
	is_salaried: z.boolean(),
	maximum_annual_salary: z.number().nullable(),
	minimum_annual_salary: z.number().nullable(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	title_description_url: z.url().nullable(),
	title_name: z.string(),
});

export const ZodTitlesInsertToDb = z.object({
	csc_code: z.string(),
	csc_description_url: z.url().nullable().optional(),
	id: z.uuid().optional(),
	is_clerical: z.boolean().optional(),
	is_salaried: z.boolean().optional(),
	maximum_annual_salary: z.number().nullable().optional(),
	minimum_annual_salary: z.number().nullable().optional(),
	title_description_url: z.url().nullable().optional(),
	title_name: z.string(),
});

export const ZodTitlesUpdateToDb = ZodTitlesInsertToDb.partial();

export type ZodTitlesRowType = z.infer<typeof ZodTitlesRow>;
export type ZodTitlesInsertType = z.infer<typeof ZodTitlesInsert>;
export type ZodTitlesUpdateType = z.infer<typeof ZodTitlesUpdate>;
export type ZodTitlesRowToDbType = z.infer<typeof ZodTitlesRowToDb>;
export type ZodTitlesInsertToDbType = z.infer<typeof ZodTitlesInsertToDb>;
export type ZodTitlesUpdateToDbType = z.infer<typeof ZodTitlesUpdateToDb>;
