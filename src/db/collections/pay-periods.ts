import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const payPeriodsCollection = createCollection(
    DBWholeCollectionOptions("pay_periods", Infinity),
);
