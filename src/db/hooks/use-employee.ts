import { eq, useLiveQuery } from "@tanstack/react-db";
import { employees } from "../collections/employees";

export function useEmployee(employee_id: string) {
    const employee_by_id = useLiveQuery(
        (q) =>
            q.from({ employee: employees }).where(({ employee }) =>
                eq(employee.id, employee_id)
            ).findOne(),
        [employee_id],
    );

    const { data, collection, isLoading, isError } = employee_by_id;
    return { data, collection, isLoading, isError };
}
