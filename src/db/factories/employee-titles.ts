import { Collection, createCollection } from "@tanstack/react-db";
import { EmployeeTitlesByEmployeeIdCollectionOptions } from "../collection-options/employee-titles";
import { getCanonicalKey } from "@/lib/collection-utils";
import { AppRow } from "@/lib/data-types";

type CollectionKeyObject = {
    employee_id: string;
};

type EmployeeTitle = AppRow<"employee_titles">;

const collectionCache = new WeakMap<
    CollectionKeyObject,
    Collection<EmployeeTitle>
>();

export const getEmployeeTitlesCollection = (
    employee_id: string,
): Collection<EmployeeTitle> => {
    const key = getCanonicalKey<CollectionKeyObject>(employee_id);

    if (collectionCache.has(key)) {
        return collectionCache.get(key)!;
    }

    const collection = createCollection<EmployeeTitle>(
        EmployeeTitlesByEmployeeIdCollectionOptions(
            employee_id,
        ),
    );
    collectionCache.set(key, collection);
    return collection;
};
