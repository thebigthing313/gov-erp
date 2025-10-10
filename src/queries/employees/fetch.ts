import type { Prettify } from "@/lib/utils";
import type { MCMECSupabaseClient } from "@/lib/supabase";
import type { Row } from "@/lib/data-types";

type Employee = Row<"employees">;
type EmployeeTitle = Prettify<Row<"employee_titles"> & { titles: Title }>;
type Title = Row<"titles">;

export async function fetchEmployeeInfoByUserId(
  supabase: MCMECSupabaseClient,
  userId: string,
): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return data as Employee;
}

export async function fetchEmployeeTitlesByUserId(
  supabase: MCMECSupabaseClient,
  userId: string,
): Promise<EmployeeTitle[]> {
  const { data, error } = await supabase
    .from("employee_titles")
    .select(`*, titles(*), employees(user_id)`)
    .eq("employees.user_id", userId)
    .order("start_date", { ascending: false });

  if (error) throw error;

  return data;
}
