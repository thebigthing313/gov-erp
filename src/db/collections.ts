import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "./whole-collections";

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

export const holidaysCollection = createCollection(
    DBWholeCollectionOptions("holidays", Infinity),
);

export const holidayDatesCollection = createCollection(
    DBWholeCollectionOptions("holiday_dates", Infinity),
);
