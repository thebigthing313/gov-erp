import { Collection, createCollection } from "@tanstack/react-db";
import { TimesheetsByYearCollectionOptions } from "../collection-options/timesheets";
import { getCanonicalKey } from "@/lib/collection-utils";
import { AppRow } from "@/lib/data-types";

type CollectionKeyObject = {
    year: number;
};

type Timesheet = AppRow<"timesheets">;

const collectionCache = new WeakMap<
    CollectionKeyObject,
    Collection<Timesheet>
>();

export const getTimesheetsCollection = (
    year: number,
): Collection<Timesheet> => {
    const key = getCanonicalKey<CollectionKeyObject>(year);

    if (collectionCache.has(key)) {
        return collectionCache.get(key)!;
    }

    const collection = createCollection<Timesheet>(
        TimesheetsByYearCollectionOptions(
            year,
        ),
    );
    collectionCache.set(key, collection);
    return collection;
};
