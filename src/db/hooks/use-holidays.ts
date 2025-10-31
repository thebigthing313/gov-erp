import { eq, useLiveQuery } from "@tanstack/react-db";
import { holidays } from "../collections/holidays";

export function useHolidays() {
    const active_holidays = useLiveQuery((q) =>
        q.from({ holiday: holidays })
            .where(({ holiday }) => eq(holiday.is_active, true))
            .orderBy(({ holiday }) => holiday.name, "asc"), []);

    const { data, collection, isLoading, isError } = active_holidays;
    return { data, collection, isLoading, isError };
}
