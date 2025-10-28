import { createCollection } from "@tanstack/react-db";
import { TimeType } from "../data-types";
import { DBWholeCollectionOptions } from "../whole-collections";

export const time_types = createCollection<TimeType>(
    DBWholeCollectionOptions("time_types", Infinity),
);
