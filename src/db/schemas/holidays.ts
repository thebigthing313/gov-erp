// Auto-generated schema file for holidays table
// Generated on: 2025-10-29T21:27:19.665Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodHolidaysRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodHolidaysRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	definition: z.string(),
	id: z.uuid(),
	is_active: z.boolean(),
	is_function_available: z.boolean(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	name: z.string(),
});

export const ZodHolidaysInsert = z.object({
	definition: z.string(),
	id: z.uuid().optional(),
	is_active: z.boolean().optional(),
	is_function_available: z.boolean().optional(),
	name: z.string(),
});

export const ZodHolidaysUpdate = ZodHolidaysInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodHolidaysRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	definition: z.string(),
	id: z.uuid(),
	is_active: z.boolean(),
	is_function_available: z.boolean(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	name: z.string(),
});

export const ZodHolidaysInsertToDb = z.object({
	definition: z.string(),
	id: z.uuid().optional(),
	is_active: z.boolean().optional(),
	is_function_available: z.boolean().optional(),
	name: z.string(),
});

export const ZodHolidaysUpdateToDb = ZodHolidaysInsertToDb.partial();

export type ZodHolidaysRowType = z.infer<typeof ZodHolidaysRow>;
export type ZodHolidaysInsertType = z.infer<typeof ZodHolidaysInsert>;
export type ZodHolidaysUpdateType = z.infer<typeof ZodHolidaysUpdate>;
export type ZodHolidaysRowToDbType = z.infer<typeof ZodHolidaysRowToDb>;
export type ZodHolidaysInsertToDbType = z.infer<typeof ZodHolidaysInsertToDb>;
export type ZodHolidaysUpdateToDbType = z.infer<typeof ZodHolidaysUpdateToDb>;
