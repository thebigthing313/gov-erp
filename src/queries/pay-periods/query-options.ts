import type { MCMECSupabaseClient } from "@/lib/supabase";
import { queryOptions } from "@tanstack/react-query";
import { payperiodKeys } from "./keys";
import {
  fetchPayPeriodById,
  fetchPayPeriodByYearAndEmployee,
  fetchPayPeriodsByYear,
} from "./fetch";

export const payPeriodsByYearQueryOptions = (
  supabase: MCMECSupabaseClient,
  payrollYear: number,
) => {
  return queryOptions({
    queryKey: payperiodKeys.year(payrollYear),
    queryFn: () => fetchPayPeriodsByYear(supabase, payrollYear),
    staleTime: Infinity,
  });
};

export const payPeriodByIdQueryOptions = (
  supabase: MCMECSupabaseClient,
  id: string,
) => {
  return queryOptions({
    queryKey: payperiodKeys.id(id),
    queryFn: () => fetchPayPeriodById(supabase, id),
    staleTime: Infinity,
  });
};

export const payPeriodByYearAndEmployeeQueryOptions = (
  supabase: MCMECSupabaseClient,
  payrollYear: number,
  employeeId: string,
) => {
  return queryOptions({
    queryKey: payperiodKeys.byYearandEmployee(payrollYear, employeeId),
    queryFn: () =>
      fetchPayPeriodByYearAndEmployee(supabase, payrollYear, employeeId),
    staleTime: 1000 * 60 * 60,
  });
};
