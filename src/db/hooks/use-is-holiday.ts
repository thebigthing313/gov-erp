import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { holiday_dates } from "../collections/holiday-dates";
import { holidays } from "../collections/holidays";

export function useIsHoliday(date: Date) {
    const { data } = useLiveSuspenseQuery(
        (q) =>
            q.from({ holiday_date: holiday_dates })
                .innerJoin(
                    { holiday: holidays },
                    ({ holiday_date, holiday }) =>
                        eq(holiday_date.holiday_id, holiday.id),
                )
                .where(({ holiday_date }) =>
                    eq(holiday_date.holiday_date, date)
                ).select(({ holiday }) => ({ name: holiday.name })),
    );

    const holiday = data.length !== 0 ? data[0].name : undefined;
    return { holiday };
}
