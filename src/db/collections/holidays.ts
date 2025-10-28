import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const holidaysCollection = createCollection(
    DBWholeCollectionOptions("holidays", Infinity),
);
