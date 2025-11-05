import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { usePayPeriods } from "./use-pay-periods";

export function usePayPeriod(year: number, pp: number) {
    const { collection: pay_periods_by_year } = usePayPeriods(year);
    return useLiveSuspenseQuery(
        (q) =>
            q.from({ pay_period: pay_periods_by_year }).where((
                { pay_period },
            ) => eq(pay_period.pay_period_number, pp)).findOne(),
        [year, pp],
    );
}
