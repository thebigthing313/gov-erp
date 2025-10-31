import { eq, useLiveQuery } from "@tanstack/react-db";
import { employees } from "../collections/employees";

export function useEmployee(employee_id: string) {
    const employee_by_id = useLiveQuery(
        (q) =>
            q.from({ employee: employees }).where(({ employee }) =>
                eq(employee.id, employee_id)
            ),
        [employee_id],
    );

    const data = employee_by_id.data?.length === 0
        ? null
        : employee_by_id.data[0];

    const { isLoading, isError } = employee_by_id;
    return { data, isLoading, isError };
}
