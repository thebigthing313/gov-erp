import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const pay_periods = createCollection(
    DBWholeCollectionOptions("pay_periods", Infinity),
);
