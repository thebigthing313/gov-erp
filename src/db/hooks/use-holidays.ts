import { and, eq, gte, lte, useLiveQuery } from "@tanstack/react-db";
import { holidays } from "../collections/holidays";
import { holiday_dates } from "../collections/holiday-dates";

export function useHolidays(year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const holidays_by_year = useLiveQuery(
        (q) =>
            q.from({ holiday_date: holiday_dates })
                .innerJoin(
                    { holiday: holidays },
                    ({ holiday_date, holiday }) =>
                        eq(holiday_date.holiday_id, holiday.id),
                )
                .where(({ holiday_date }) =>
                    and(
                        gte(holiday_date.holiday_date, startOfYear),
                        lte(holiday_date.holiday_date, endOfYear),
                    )
                )
                .orderBy(({ holiday_date }) => holiday_date.holiday_date, "asc")
                .select(({ holiday, holiday_date }) => {
                    return {
                        ...holiday_date,
                        holiday: holiday,
                    };
                }),
        [year],
    );

    const { data, isLoading, isError } = holidays_by_year;
    return { data, isLoading, isError };
}
