import { eq, useLiveQuery } from "@tanstack/react-db";
import { payPeriodsCollection } from "../collections";

export function usePayPeriods(year: number) {
    const query = useLiveQuery(
        (q) =>
            q.from({ pay_periods: payPeriodsCollection }).where(
                ({ pay_periods }) => eq(pay_periods.payroll_year, year),
            ).orderBy(
                ({ pay_periods }) => pay_periods.pay_period_number,
                "asc",
            ),
        [year],
    );

    return {
        pay_periods_by_year: query,
        pay_periods: payPeriodsCollection,
    };
}
