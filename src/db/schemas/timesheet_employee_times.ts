// Auto-generated schema file for timesheet_employee_times table
// Generated on: 2025-10-29T21:27:13.595Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodTimesheetEmployeeTimesRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodTimesheetEmployeeTimesRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	hours_amount: z.number(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	time_type_id: z.uuid(),
	timesheet_employee_id: z.uuid(),
});

export const ZodTimesheetEmployeeTimesInsert = z.object({
	hours_amount: z.number().optional(),
	id: z.uuid().optional(),
	time_type_id: z.uuid(),
	timesheet_employee_id: z.uuid(),
});

export const ZodTimesheetEmployeeTimesUpdate = ZodTimesheetEmployeeTimesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodTimesheetEmployeeTimesRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	hours_amount: z.number(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	time_type_id: z.uuid(),
	timesheet_employee_id: z.uuid(),
});

export const ZodTimesheetEmployeeTimesInsertToDb = z.object({
	hours_amount: z.number().optional(),
	id: z.uuid().optional(),
	time_type_id: z.uuid(),
	timesheet_employee_id: z.uuid(),
});

export const ZodTimesheetEmployeeTimesUpdateToDb = ZodTimesheetEmployeeTimesInsertToDb.partial();

export type ZodTimesheetEmployeeTimesRowType = z.infer<typeof ZodTimesheetEmployeeTimesRow>;
export type ZodTimesheetEmployeeTimesInsertType = z.infer<typeof ZodTimesheetEmployeeTimesInsert>;
export type ZodTimesheetEmployeeTimesUpdateType = z.infer<typeof ZodTimesheetEmployeeTimesUpdate>;
export type ZodTimesheetEmployeeTimesRowToDbType = z.infer<typeof ZodTimesheetEmployeeTimesRowToDb>;
export type ZodTimesheetEmployeeTimesInsertToDbType = z.infer<typeof ZodTimesheetEmployeeTimesInsertToDb>;
export type ZodTimesheetEmployeeTimesUpdateToDbType = z.infer<typeof ZodTimesheetEmployeeTimesUpdateToDb>;
