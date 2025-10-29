import { describe, expect, it, vi } from "vitest";
import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

// Mock all dependencies
vi.mock("@tanstack/react-db", () => ({
    createCollection: vi.fn(),
}));

vi.mock("@tanstack/query-db-collection", () => ({
    queryCollectionOptions: vi.fn(),
}));

vi.mock("@/integrations/tanstack-query/root-provider", () => ({
    getContext: () => ({
        queryClient: "mock-query-client",
    }),
}));

describe("partitioned-collection", () => {
    describe("timesheets collection factory", () => {
        it("should export a timesheets factory function", async () => {
            const { timesheets } = await import("../collections/timesheets");

            expect(typeof timesheets).toBe("function");
        });

        it("should create collection when called with a year", async () => {
            const mockCollection = { id: "test-collection", on: vi.fn() };
            vi.mocked(createCollection).mockReturnValue(mockCollection as any);
            vi.mocked(queryCollectionOptions).mockReturnValue({} as any);

            const { timesheets } = await import("../collections/timesheets");

            const result = timesheets(2023);

            expect(vi.mocked(queryCollectionOptions)).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ["timesheets", "year", 2023],
                    queryClient: "mock-query-client",
                    staleTime: 1800000,
                }),
            );
            expect(vi.mocked(createCollection)).toHaveBeenCalled();
            expect(result).toBe(mockCollection);
        });

        it("should accept different year parameters", async () => {
            const mockCollection = { id: "test-collection", on: vi.fn() };
            vi.mocked(createCollection).mockReturnValue(mockCollection as any);
            vi.mocked(queryCollectionOptions).mockReturnValue({} as any);

            const { timesheets } = await import("../collections/timesheets");

            timesheets(2023);
            vi.clearAllMocks();
            timesheets(2024);

            expect(vi.mocked(queryCollectionOptions)).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ["timesheets", "year", 2024],
                }),
            );
        });
    });
});
