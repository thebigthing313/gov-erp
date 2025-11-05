import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { timesheets } from "../collections/timesheets";
import { pay_periods } from "../collections/pay-periods";

export function useTimesheets(year: number) {
    return useLiveSuspenseQuery(
        (q) =>
            q.from({ timesheet: timesheets(year) }).innerJoin({
                pay_period: pay_periods,
            }, ({ timesheet, pay_period }) =>
                eq(
                    timesheet.pay_period_id,
                    pay_period.id,
                )).orderBy(
                    ({ timesheet }) => timesheet.timesheet_date,
                ).select(({ timesheet, pay_period }) => {
                    return {
                        ...timesheet,
                        pay_period_number: pay_period.pay_period_number,
                        payroll_year: pay_period.payroll_year,
                    };
                }),
        [year],
    );
}
