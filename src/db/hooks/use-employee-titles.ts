import { eq, useLiveQuery } from "@tanstack/react-db";
import { getEmployeeTitlesCollection } from "../factories/employee-titles";
import { titlesCollection } from "../collections";

export function useEmployeeTitles(employee_id: string) {
    const collection = getEmployeeTitlesCollection(employee_id);
    const query = useLiveQuery((q) =>
        q.from({ employee_titles: collection }).innerJoin(
            { titles: titlesCollection },
            ({ employee_titles, titles }) =>
                eq(employee_titles.title_id, titles.id),
        ).where(({ employee_titles }) =>
            employee_titles.employee_id === employee_id
        ).orderBy(({ employee_titles }) => employee_titles.start_date, "desc")
    );

    return { query, collection };
}
