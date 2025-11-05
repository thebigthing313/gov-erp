import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { employees } from "../collections/employees";

export function useEmployee(employee_id: string) {
    const query = useLiveSuspenseQuery(
        (q) =>
            q.from({ employee: employees }).where(({ employee }) =>
                eq(employee.id, employee_id)
            ).findOne(),
        [employee_id],
    );

    if (!query.data) {
        throw new Error(`Employee with id ${employee_id} not found`);
    }

    return query.data;
}
