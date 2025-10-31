// Auto-generated schema file for pay_periods table
// Generated on: 2025-10-31T14:02:42.164Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodPayPeriodsRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodPayPeriodsRow = z.object({
	begin_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	end_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	id: z.uuid(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	pay_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	pay_period_number: z.number(),
	payroll_year: z.number(),
});

export const ZodPayPeriodsInsert = z.object({
	begin_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	end_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	id: z.uuid().optional(),
	pay_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	pay_period_number: z.number(),
	payroll_year: z.number(),
});

export const ZodPayPeriodsUpdate = ZodPayPeriodsInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodPayPeriodsRowToDb = z.object({
	begin_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	end_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	id: z.uuid(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	pay_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	pay_period_number: z.number(),
	payroll_year: z.number(),
});

export const ZodPayPeriodsInsertToDb = z.object({
	begin_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	end_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	id: z.uuid().optional(),
	pay_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	pay_period_number: z.number(),
	payroll_year: z.number(),
});

export const ZodPayPeriodsUpdateToDb = ZodPayPeriodsInsertToDb.partial();

export type ZodPayPeriodsRowType = z.infer<typeof ZodPayPeriodsRow>;
export type ZodPayPeriodsInsertType = z.infer<typeof ZodPayPeriodsInsert>;
export type ZodPayPeriodsUpdateType = z.infer<typeof ZodPayPeriodsUpdate>;
export type ZodPayPeriodsRowToDbType = z.infer<typeof ZodPayPeriodsRowToDb>;
export type ZodPayPeriodsInsertToDbType = z.infer<typeof ZodPayPeriodsInsertToDb>;
export type ZodPayPeriodsUpdateToDbType = z.infer<typeof ZodPayPeriodsUpdateToDb>;
