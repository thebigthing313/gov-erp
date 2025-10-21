import { Collection, createCollection } from "@tanstack/react-db";
import { TimesheetEmployeeTimesByEmployeeYearCollectionOptions } from "../collection-options/timesheet-employee-times";
import { getCanonicalKey } from "@/lib/collection-utils";
import { AppRow } from "@/lib/data-types";

type CollectionKeyObject = {
    year: number;
    employee_id: string;
};

type TimeSheetEmployeeTime = AppRow<"timesheet_employee_times">;

const collectionCache = new WeakMap<
    CollectionKeyObject,
    Collection<TimeSheetEmployeeTime>
>();

export const getTimesheetEmployeeTimesCollection = (
    year: number,
    employee_id: string,
): Collection<TimeSheetEmployeeTime> => {
    const key = getCanonicalKey<CollectionKeyObject>(year, employee_id);

    if (collectionCache.has(key)) {
        return collectionCache.get(key)!;
    }

    const collection = createCollection<TimeSheetEmployeeTime>(
        TimesheetEmployeeTimesByEmployeeYearCollectionOptions(
            year,
            employee_id,
        ),
    );
    collectionCache.set(key, collection);
    return collection;
};
