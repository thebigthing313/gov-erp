import { eq, useLiveQuery } from "@tanstack/react-db";
import { holidayDatesCollection, holidaysCollection } from "../collections";

export function useHolidays(year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const query = useLiveQuery((q) =>
        q.from({ holiday_dates: holidayDatesCollection }).innerJoin(
            { holidays: holidaysCollection },
            ({ holiday_dates, holidays }) =>
                eq(holiday_dates.holiday_id, holidays.id),
        ).where(({ holiday_dates }) =>
            holiday_dates.holiday_date >= startOfYear &&
            holiday_dates.holiday_date < endOfYear
        ).orderBy(({ holiday_dates }) => holiday_dates.holiday_date, "asc")
    );
    return { query, collection: holidaysCollection };
}
