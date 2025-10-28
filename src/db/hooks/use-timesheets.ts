import { useLiveQuery } from "@tanstack/react-db";
import { getTimesheetsCollection } from "../factories/timesheets";

export function useTimesheets(year: number) {
    const collection = getTimesheetsCollection(year);
    const query = useLiveQuery(
        (q) =>
            q.from({ timesheets: collection }).orderBy(
                ({ timesheets }) => timesheets.timesheet_date,
            ),
    );
    return { timesheets_by_year: query, timesheets: collection };
}
