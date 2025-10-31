import { eq, useLiveQuery } from "@tanstack/react-db";
import { employee_titles } from "../collections/employee-titles";
import { titles } from "../collections/titles";

export function useEmployeeTitles(employee_id: string) {
    const employee_titles_by_employee_id = useLiveQuery(
        (q) =>
            q.from({ employee_title: employee_titles(employee_id) }).innerJoin(
                { title: titles },
                ({ employee_title, title }) =>
                    eq(employee_title.title_id, title.id),
            ).where(({ employee_title }) =>
                eq(employee_title.employee_id, employee_id)
            ).orderBy(({ employee_title }) => employee_title.start_date, "desc")
                .select(({ title, employee_title }) => {
                    return {
                        ...employee_title,
                        title: title,
                    };
                }),
        [employee_id],
    );

    const { data, collection, isLoading, isError } =
        employee_titles_by_employee_id;
    return { data, collection, isLoading, isError };
}
