import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { holidays } from "../collections/holidays";

export function useHolidays() {
    return useLiveSuspenseQuery((q) =>
        q.from({ holiday: holidays })
            .where(({ holiday }) => eq(holiday.is_active, true))
            .orderBy(({ holiday }) => holiday.name, "asc"), []);
}
