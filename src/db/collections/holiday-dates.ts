import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const holiday_dates = createCollection(
    DBWholeCollectionOptions("holiday_dates", Infinity),
);
