// Auto-generated schema file for employee_titles table
// Generated on: 2025-11-07T20:50:43.517Z
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = ZodEmployeeTitlesRow.parse(dataFromSupabase);

import z from 'zod';

export const ZodEmployeeTitlesRow = z.object({
	created_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	created_by: z.uuid().nullable().optional(),
	employee_id: z.uuid(),
	end_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()).nullable(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date()).optional(),
	modified_by: z.uuid().nullable().optional(),
	start_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	title_id: z.uuid(),
	title_status: z.enum(["permanent", "part-time", "seasonal", "provisional", "volunteer"]),
});

export const ZodEmployeeTitlesInsert = z.object({
	employee_id: z.uuid(),
	end_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()).nullable().optional(),
	id: z.uuid().optional(),
	start_date: z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `${val}T00:00:00Z`) : val, z.date()),
	title_id: z.uuid(),
	title_status: z.enum(["permanent", "part-time", "seasonal", "provisional", "volunteer"]),
});

export const ZodEmployeeTitlesUpdate = ZodEmployeeTitlesInsert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const ZodEmployeeTitlesRowToDb = z.object({
	created_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	created_by: z.uuid().nullable().optional(),
	employee_id: z.uuid(),
	end_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()).nullable(),
	id: z.uuid(),
	modified_at: z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string()).optional(),
	modified_by: z.uuid().nullable().optional(),
	start_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	title_id: z.uuid(),
	title_status: z.enum(["permanent", "part-time", "seasonal", "provisional", "volunteer"]),
});

export const ZodEmployeeTitlesInsertToDb = z.object({
	employee_id: z.uuid(),
	end_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()).nullable().optional(),
	id: z.uuid().optional(),
	start_date: z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string()),
	title_id: z.uuid(),
	title_status: z.enum(["permanent", "part-time", "seasonal", "provisional", "volunteer"]),
});

export const ZodEmployeeTitlesUpdateToDb = ZodEmployeeTitlesInsertToDb.partial();

export type ZodEmployeeTitlesRowType = z.infer<typeof ZodEmployeeTitlesRow>;
export type ZodEmployeeTitlesInsertType = z.infer<typeof ZodEmployeeTitlesInsert>;
export type ZodEmployeeTitlesUpdateType = z.infer<typeof ZodEmployeeTitlesUpdate>;
export type ZodEmployeeTitlesRowToDbType = z.infer<typeof ZodEmployeeTitlesRowToDb>;
export type ZodEmployeeTitlesInsertToDbType = z.infer<typeof ZodEmployeeTitlesInsertToDb>;
export type ZodEmployeeTitlesUpdateToDbType = z.infer<typeof ZodEmployeeTitlesUpdateToDb>;
