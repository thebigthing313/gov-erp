import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const holidayDatesCollection = createCollection(
    DBWholeCollectionOptions("holiday_dates", Infinity),
);
