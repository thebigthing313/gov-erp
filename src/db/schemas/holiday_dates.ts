// Auto-generated schema file for holiday_dates table
// Generated on: 2025-10-29T21:27:30.099Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodHolidayDatesRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodHolidayDatesRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	holiday_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	holiday_id: z.uuid(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
});

export const ZodHolidayDatesInsert = z.object({
	holiday_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	holiday_id: z.uuid(),
	id: z.uuid().optional(),
});

export const ZodHolidayDatesUpdate = ZodHolidayDatesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodHolidayDatesRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	holiday_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	holiday_id: z.uuid(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
});

export const ZodHolidayDatesInsertToDb = z.object({
	holiday_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	holiday_id: z.uuid(),
	id: z.uuid().optional(),
});

export const ZodHolidayDatesUpdateToDb = ZodHolidayDatesInsertToDb.partial();

export type ZodHolidayDatesRowType = z.infer<typeof ZodHolidayDatesRow>;
export type ZodHolidayDatesInsertType = z.infer<typeof ZodHolidayDatesInsert>;
export type ZodHolidayDatesUpdateType = z.infer<typeof ZodHolidayDatesUpdate>;
export type ZodHolidayDatesRowToDbType = z.infer<typeof ZodHolidayDatesRowToDb>;
export type ZodHolidayDatesInsertToDbType = z.infer<typeof ZodHolidayDatesInsertToDb>;
export type ZodHolidayDatesUpdateToDbType = z.infer<typeof ZodHolidayDatesUpdateToDb>;
