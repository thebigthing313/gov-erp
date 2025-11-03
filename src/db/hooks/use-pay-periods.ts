import { eq, useLiveQuery } from "@tanstack/react-db";
import { pay_periods } from "../collections/pay-periods";

export function usePayPeriods(year: number) {
    const pay_periods_by_year = useLiveQuery(
        (q) =>
            q.from({ pay_periods: pay_periods }).where(
                ({ pay_periods }) => eq(pay_periods.payroll_year, year),
            ).orderBy(
                ({ pay_periods }) => pay_periods.pay_period_number,
                "asc",
            ),
        [year],
    );

    const { data, collection, isLoading, isError } = pay_periods_by_year;

    return { data, collection, isLoading, isError };
}
