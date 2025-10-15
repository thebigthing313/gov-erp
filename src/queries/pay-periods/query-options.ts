import { queryOptions } from "@tanstack/react-query";
import { payperiodKeys } from "./keys";
import {
  fetchPayPeriodById,
  fetchPayPeriodByYearAndEmployee,
  fetchPayPeriodsByYear,
} from "./fetch";

export const payPeriodsByYearQueryOptions = (
  payrollYear: number,
) => {
  return queryOptions({
    queryKey: payperiodKeys.year(payrollYear),
    queryFn: () => fetchPayPeriodsByYear(payrollYear),
    staleTime: Infinity,
  });
};

export const payPeriodByIdQueryOptions = (
  id: string,
) => {
  return queryOptions({
    queryKey: payperiodKeys.id(id),
    queryFn: () => fetchPayPeriodById(id),
    staleTime: Infinity,
  });
};

export const payPeriodByYearAndEmployeeQueryOptions = (
  payrollYear: number,
  employeeId: string,
) => {
  return queryOptions({
    queryKey: payperiodKeys.byYearandEmployee(payrollYear, employeeId),
    queryFn: () => fetchPayPeriodByYearAndEmployee(payrollYear, employeeId),
    staleTime: 1000 * 60 * 60,
  });
};
