import { and, eq, gte, lte, useLiveSuspenseQuery } from "@tanstack/react-db";
import { usePayPeriods } from "./use-pay-periods";
import { useTimesheets } from "./use-timesheets";

export function useCurrentTimesheetInfo() {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const date = now.getUTCDate();

    const todayMidnightUTC = new Date(Date.UTC(year, month, date));

    const { collection: timesheets_by_year } = useTimesheets(year);
    const { collection: pay_periods_by_year } = usePayPeriods(year);

    const { data: current_timesheet } = useLiveSuspenseQuery(
        (q) =>
            q.from({ timesheet: timesheets_by_year }).where(({ timesheet }) =>
                eq(timesheet.timesheet_date, todayMidnightUTC)
            ).select(({ timesheet }) => {
                return {
                    timesheet_date: timesheet.timesheet_date,
                };
            }).findOne(),
        [timesheets_by_year],
    );

    const { data: current_pay_period } = useLiveSuspenseQuery(
        (q) =>
            q.from({ pay_periods: pay_periods_by_year }).where((
                { pay_periods },
            ) => and(
                lte(pay_periods.begin_date, todayMidnightUTC),
                gte(pay_periods.end_date, todayMidnightUTC),
            )).select(({ pay_periods }) => {
                return {
                    pay_period_number: pay_periods.pay_period_number,
                    payroll_year: pay_periods.payroll_year,
                };
            }).findOne(),
        [pay_periods_by_year],
    );

    return {
        current_payroll_year: current_pay_period?.payroll_year,
        current_pay_period: current_pay_period?.pay_period_number,
        current_timesheet: current_timesheet?.timesheet_date,
    };
}
