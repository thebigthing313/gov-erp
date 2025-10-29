import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

export const titles = createCollection(
    DBWholeCollectionOptions("titles", Infinity),
);
