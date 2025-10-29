import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const holidays = createCollection(
    DBWholeCollectionOptions("holidays", Infinity),
);
