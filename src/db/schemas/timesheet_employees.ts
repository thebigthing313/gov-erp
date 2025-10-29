// Auto-generated schema file for timesheet_employees table
// Generated on: 2025-10-29T21:27:10.643Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodTimesheetEmployeesRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodTimesheetEmployeesRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	employee_id: z.uuid(),
	id: z.uuid(),
	is_late: z.boolean(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	notes: z.string().nullable(),
	timesheet_id: z.uuid(),
});

export const ZodTimesheetEmployeesInsert = z.object({
	employee_id: z.uuid(),
	id: z.uuid().optional(),
	is_late: z.boolean().optional(),
	notes: z.string().nullable().optional(),
	timesheet_id: z.uuid(),
});

export const ZodTimesheetEmployeesUpdate = ZodTimesheetEmployeesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodTimesheetEmployeesRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	employee_id: z.uuid(),
	id: z.uuid(),
	is_late: z.boolean(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	notes: z.string().nullable(),
	timesheet_id: z.uuid(),
});

export const ZodTimesheetEmployeesInsertToDb = z.object({
	employee_id: z.uuid(),
	id: z.uuid().optional(),
	is_late: z.boolean().optional(),
	notes: z.string().nullable().optional(),
	timesheet_id: z.uuid(),
});

export const ZodTimesheetEmployeesUpdateToDb = ZodTimesheetEmployeesInsertToDb.partial();

export type ZodTimesheetEmployeesRowType = z.infer<typeof ZodTimesheetEmployeesRow>;
export type ZodTimesheetEmployeesInsertType = z.infer<typeof ZodTimesheetEmployeesInsert>;
export type ZodTimesheetEmployeesUpdateType = z.infer<typeof ZodTimesheetEmployeesUpdate>;
export type ZodTimesheetEmployeesRowToDbType = z.infer<typeof ZodTimesheetEmployeesRowToDb>;
export type ZodTimesheetEmployeesInsertToDbType = z.infer<typeof ZodTimesheetEmployeesInsertToDb>;
export type ZodTimesheetEmployeesUpdateToDbType = z.infer<typeof ZodTimesheetEmployeesUpdateToDb>;
