// Auto-generated schema file for timesheets table
// Generated on: 2025-10-29T18:33:06.747Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodTimesheetsRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodTimesheetsRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()),
	created_by: z.uuid().nullable(),
	holiday_date_id: z.uuid().nullable(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()),
	modified_by: z.uuid().nullable(),
	notes: z.string().nullable(),
	pay_period_id: z.uuid(),
	timesheet_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
});

export const ZodTimesheetsInsert = z.object({
	holiday_date_id: z.uuid().nullable().optional(),
	notes: z.string().nullable().optional(),
	pay_period_id: z.uuid(),
	timesheet_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
});

export const ZodTimesheetsUpdate = ZodTimesheetsInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodTimesheetsRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()),
	created_by: z.uuid().nullable(),
	holiday_date_id: z.uuid().nullable(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()),
	modified_by: z.uuid().nullable(),
	notes: z.string().nullable(),
	pay_period_id: z.uuid(),
	timesheet_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
});

export const ZodTimesheetsInsertToDb = z.object({
	holiday_date_id: z.uuid().nullable().optional(),
	notes: z.string().nullable().optional(),
	pay_period_id: z.uuid(),
	timesheet_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
});

export const ZodTimesheetsUpdateToDb = ZodTimesheetsInsertToDb.partial();

export type ZodTimesheetsRowType = z.infer<typeof ZodTimesheetsRow>;
export type ZodTimesheetsInsertType = z.infer<typeof ZodTimesheetsInsert>;
export type ZodTimesheetsUpdateType = z.infer<typeof ZodTimesheetsUpdate>;
export type ZodTimesheetsRowToDbType = z.infer<typeof ZodTimesheetsRowToDb>;
export type ZodTimesheetsInsertToDbType = z.infer<typeof ZodTimesheetsInsertToDb>;
export type ZodTimesheetsUpdateToDbType = z.infer<typeof ZodTimesheetsUpdateToDb>;
