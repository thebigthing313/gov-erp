import { queryOptions } from "@tanstack/react-query";
import { employeeKeys } from "./keys";
import {
  fetchEmployeeInfoByUserId,
  fetchEmployeeTitlesByUserId,
} from "./fetch";

export const employeeInfoQueryOptions = (
  userId: string,
) => {
  return queryOptions({
    queryKey: employeeKeys.user_id(userId),
    queryFn: () => fetchEmployeeInfoByUserId(userId),
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
  });
};

export const employeeTitlesByUserIdQueryOptions = (
  userId: string,
) => {
  return queryOptions({
    queryKey: employeeKeys.titles(userId),
    queryFn: () => fetchEmployeeTitlesByUserId(userId),
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
  });
};
