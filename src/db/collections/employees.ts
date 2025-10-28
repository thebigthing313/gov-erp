import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";
import { Employee } from "../data-types";

export const employees = createCollection<Employee>(
    DBWholeCollectionOptions("employees", 1000 * 60 * 60),
);
