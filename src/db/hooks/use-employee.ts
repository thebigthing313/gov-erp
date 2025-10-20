import { eq, useLiveQuery } from "@tanstack/react-db";
import { employeesCollection } from "../collections";

export function useEmployee(employee_id: string) {
    const query = useLiveQuery((q) =>
        q.from({ employee: employeesCollection }).where(({ employee }) =>
            eq(employee.id, employee_id)
        )
    );

    return { query, collection: employeesCollection };
}
