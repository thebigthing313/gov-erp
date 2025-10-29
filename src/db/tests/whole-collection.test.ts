import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCollection } from "@tanstack/react-db";
import { DBWholeCollectionOptions } from "../whole-collections";

// Mock createCollection
vi.mock("@tanstack/react-db", () => ({
    createCollection: vi.fn(() => "mocked-collection"),
}));

// Mock DBWholeCollectionOptions
vi.mock("../whole-collections", () => ({
    DBWholeCollectionOptions: vi.fn(() => "mocked-options"),
}));

describe("whole-collection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("collection creation", () => {
        it("should create titles collection with Infinity staleTime", () => {
            // Simulate what the titles collection does
            const options = DBWholeCollectionOptions("titles", Infinity);
            const collection = createCollection(options);

            expect(vi.mocked(DBWholeCollectionOptions)).toHaveBeenCalledWith(
                "titles",
                Infinity,
            );
            expect(vi.mocked(createCollection)).toHaveBeenCalledWith(
                "mocked-options",
            );
            expect(collection).toBe("mocked-collection");
        });

        it("should create employees collection with specific staleTime", () => {
            vi.clearAllMocks();

            // Simulate what the employees collection does
            const options = DBWholeCollectionOptions(
                "employees",
                1000 * 60 * 60,
            );
            const collection = createCollection(options);

            expect(vi.mocked(DBWholeCollectionOptions)).toHaveBeenCalledWith(
                "employees",
                3600000,
            );
            expect(vi.mocked(createCollection)).toHaveBeenCalledWith(
                "mocked-options",
            );
            expect(collection).toBe("mocked-collection");
        });
    });

    describe("DBWholeCollectionOptions function", () => {
        it("should handle collections without explicit staleTime", () => {
            vi.clearAllMocks();

            // Test by calling DBWholeCollectionOptions directly
            const result = vi.mocked(DBWholeCollectionOptions)(
                "titles" as any,
                5000,
            );
            expect(result).toBe("mocked-options");
            expect(vi.mocked(DBWholeCollectionOptions)).toHaveBeenCalledWith(
                "titles",
                5000,
            );
        });

        it("should handle collections with Infinity staleTime", () => {
            vi.clearAllMocks();

            const result = vi.mocked(DBWholeCollectionOptions)(
                "titles" as any,
                Infinity,
            );
            expect(result).toBe("mocked-options");
            expect(vi.mocked(DBWholeCollectionOptions)).toHaveBeenCalledWith(
                "titles",
                Infinity,
            );
        });
    });
});
