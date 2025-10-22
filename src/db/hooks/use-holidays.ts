import { and, eq, gte, lte, useLiveQuery } from "@tanstack/react-db";
import { holidayDatesCollection, holidaysCollection } from "../collections";

export function useHolidays(year: number) {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const query = useLiveQuery(
        (q) =>
            q.from({ holiday_dates: holidayDatesCollection }).innerJoin(
                { holidays: holidaysCollection },
                ({ holiday_dates, holidays }) =>
                    eq(holiday_dates.holiday_id, holidays.id),
            ).where(({ holiday_dates }) => {
                return and(
                    gte(holiday_dates.holiday_date, startOfYear),
                    lte(holiday_dates.holiday_date, endOfYear),
                );
            })
                .orderBy(
                    ({ holiday_dates }) => holiday_dates.holiday_date,
                    "asc",
                ),
        [year],
    );
    return { query, collection: holidaysCollection };
}
