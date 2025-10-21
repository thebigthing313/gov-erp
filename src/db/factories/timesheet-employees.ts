import { Collection, createCollection } from "@tanstack/react-db";
import { TimesheetEmployeesByEmployeeYearCollectionOptions } from "../collection-options/timesheet-employees";
import { getCanonicalKey } from "@/lib/collection-utils";
import { AppRow } from "@/lib/data-types";

type CollectionKeyObject = {
    year: number;
    employee_id: string;
};

type TimesheetEmployee = AppRow<"timesheet_employees">;

const collectionCache = new WeakMap<
    CollectionKeyObject,
    Collection<TimesheetEmployee>
>();

export const getTimesheetEmployeesCollection = (
    year: number,
    employee_id: string,
): Collection<TimesheetEmployee> => {
    const key = getCanonicalKey<CollectionKeyObject>(year, employee_id);

    if (collectionCache.has(key)) {
        return collectionCache.get(key)!;
    }

    const collection = createCollection<TimesheetEmployee>(
        TimesheetEmployeesByEmployeeYearCollectionOptions(year, employee_id),
    );
    collectionCache.set(key, collection);
    return collection;
};
