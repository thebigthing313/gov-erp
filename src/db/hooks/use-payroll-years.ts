import { count, max, min, useLiveSuspenseQuery } from "@tanstack/react-db";
import { pay_periods } from "../collections/pay-periods";

export function usePayrollYears() {
    return useLiveSuspenseQuery((q) =>
        q.from({ pay_period: pay_periods }).groupBy(({ pay_period }) =>
            pay_period.payroll_year
        ).select(({ pay_period }) => ({
            year: pay_period.payroll_year,
            start_date: min(pay_period.begin_date),
            end_date: max(pay_period.end_date),
            first_pay_date: min(pay_period.pay_date),
            last_pay_date: max(pay_period.pay_date),
            pay_period_count: count(pay_period.id),
        })).orderBy(({ pay_period }) => pay_period.payroll_year, "desc")
    );
}
