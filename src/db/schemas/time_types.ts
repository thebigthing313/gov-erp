// Auto-generated schema file for time_types table
// Generated on: 2025-10-29T21:34:41.607Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodTimeTypesRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodTimeTypesRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	id: z.uuid(),
	is_paid: z.boolean(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	type_name: z.string(),
	type_short_name: z.string(),
});

export const ZodTimeTypesInsert = z.object({
	id: z.uuid().optional(),
	is_paid: z.boolean(),
	type_name: z.string(),
	type_short_name: z.string(),
});

export const ZodTimeTypesUpdate = ZodTimeTypesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodTimeTypesRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	id: z.uuid(),
	is_paid: z.boolean(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	type_name: z.string(),
	type_short_name: z.string(),
});

export const ZodTimeTypesInsertToDb = z.object({
	id: z.uuid().optional(),
	is_paid: z.boolean(),
	type_name: z.string(),
	type_short_name: z.string(),
});

export const ZodTimeTypesUpdateToDb = ZodTimeTypesInsertToDb.partial();

export type ZodTimeTypesRowType = z.infer<typeof ZodTimeTypesRow>;
export type ZodTimeTypesInsertType = z.infer<typeof ZodTimeTypesInsert>;
export type ZodTimeTypesUpdateType = z.infer<typeof ZodTimeTypesUpdate>;
export type ZodTimeTypesRowToDbType = z.infer<typeof ZodTimeTypesRowToDb>;
export type ZodTimeTypesInsertToDbType = z.infer<typeof ZodTimeTypesInsertToDb>;
export type ZodTimeTypesUpdateToDbType = z.infer<typeof ZodTimeTypesUpdateToDb>;
