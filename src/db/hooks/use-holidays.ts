import {
    and,
    eq,
    gte,
    isUndefined,
    lte,
    useLiveQuery,
} from "@tanstack/react-db";
import { holidayDatesCollection, holidaysCollection } from "../collections";

export function useHolidays(year: number) {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const holidayDatesByYear = useLiveQuery(
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
                ).select(({ holidays, holiday_dates }) => {
                    return {
                        id: holiday_dates.id,
                        holiday_id: holiday_dates.holiday_id,
                        holiday_date: holiday_dates.holiday_date,
                        name: holidays.name,
                    };
                }),
        [year],
    );

    const missingHolidaysByYear = useLiveQuery(
        (q) =>
            q.from({ holidays: holidaysCollection }).leftJoin(
                { holiday_dates: holidayDatesByYear.collection },
                ({ holidays, holiday_dates }) =>
                    eq(holiday_dates.holiday_id, holidays.id),
            ).where(({ holiday_dates, holidays }) =>
                and(isUndefined(holiday_dates), eq(holidays.is_active, true))
            ).select(
                ({ holidays }) => {
                    return {
                        id: holidays.id,
                        name: holidays.name,
                    };
                },
            ),
        [year],
    );

    return {
        holidayDatesByYear,
        missingHolidaysByYear,
        holidays: holidaysCollection,
        holiday_dates: holidayDatesCollection,
    };
}
