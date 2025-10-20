import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "./whole-collections";
import { TimesheetsByYearCollectionOptions } from "./collection-options/timesheets";
import { TimesheetEmployeesByEmployeeYearCollectionOptions } from "./collection-options/timesheet-employees";
import { TimesheetEmployeeTimesByEmployeeYearCollectionOptions } from "./collection-options/timesheet-employee-times";

export const employeesCollection = createCollection(
    DBWholeCollectionOptions("employees", 1000 * 60 * 60),
); // 1 hour
export const titlesCollection = createCollection(
    DBWholeCollectionOptions("titles", Infinity),
); // No expiration
export const timeTypesCollection = createCollection(
    DBWholeCollectionOptions("time_types", Infinity),
);
export const payPeriodsCollection = createCollection(
    DBWholeCollectionOptions("pay_periods", Infinity),
);

export const timesheetsCollection = (year: number) =>
    createCollection(TimesheetsByYearCollectionOptions(year));

export const timesheetEmployeesCollection = (
    year: number,
    employee_id: string,
) => createCollection(
    TimesheetEmployeesByEmployeeYearCollectionOptions(year, employee_id),
);

export const timesheetEmployeeTimesCollection = (
    year: number,
    employee_id: string,
) => createCollection(
    TimesheetEmployeeTimesByEmployeeYearCollectionOptions(year, employee_id),
);
