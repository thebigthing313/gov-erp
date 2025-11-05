import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { pay_periods } from "../collections/pay-periods";

export function usePayPeriods(year: number) {
    return useLiveSuspenseQuery(
        (q) =>
            q.from({ pay_periods: pay_periods }).where(
                ({ pay_periods }) => eq(pay_periods.payroll_year, year),
            ).orderBy(
                ({ pay_periods }) => pay_periods.pay_period_number,
                "asc",
            ),
        [year],
    );
}
