import { queryOptions } from "@tanstack/react-query";
import { employeeKeys } from "./keys";
import {
  fetchEmployeeInfoByUserId,
  fetchEmployeeTitlesByUserId,
} from "./fetch";
import type { MCMECSupabaseClient } from "@/lib/supabase";

export const employeeInfoQueryOptions = (
  supabase: MCMECSupabaseClient,
  userId: string,
) => {
  return queryOptions({
    queryKey: employeeKeys.user_id(userId),
    queryFn: () => fetchEmployeeInfoByUserId(supabase, userId),
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
  });
};

export const employeeTitlesByUserIdQueryOptions = (
  supabase: MCMECSupabaseClient,
  userId: string,
) => {
  return queryOptions({
    queryKey: employeeKeys.titles(userId),
    queryFn: () => fetchEmployeeTitlesByUserId(supabase, userId),
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
  });
};
