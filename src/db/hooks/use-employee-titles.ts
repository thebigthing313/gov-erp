import { eq, useLiveQuery } from "@tanstack/react-db";
import { employee_titles } from "../collections/employee-titles";
import { titles } from "../collections/titles";

export function useEmployeeTitles(employee_id: string) {
    const collection = employee_titles(employee_id);
    const employee_titles_by_employee_id = useLiveQuery((q) =>
        q.from({ employee_titles: collection }).innerJoin(
            { titles: titles },
            ({ employee_titles, titles }) => eq(employee_titles, titles.id),
        ).where(({ employee_titles }) =>
            eq(employee_titles.employee_id, employee_id)
        ).orderBy(({ employee_titles }) => employee_titles.start_date, "desc")
    );

    return { employee_titles_by_employee_id };
}
