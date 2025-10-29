import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    collectionOnDelete,
    collectionOnInsert,
    collectionOnUpdate,
} from "../collection-functions";
import { dbDelete, dbInsert, dbUpdate } from "../db-functions";
import { toast } from "sonner";

// Mock the db-functions
vi.mock("../db-functions", () => ({
    dbDelete: vi.fn(),
    dbInsert: vi.fn(),
    dbUpdate: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe("collection-functions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("collectionOnDelete", () => {
        it("should delete items and update collection on success", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [
                    { key: "1" },
                    { key: "2" },
                ],
            };
            const mockCollection = {
                utils: {
                    writeDelete: vi.fn(),
                },
            };

            vi.mocked(dbDelete).mockResolvedValue(undefined);

            const result = await collectionOnDelete(
                mockTable,
                mockTransaction as any,
                mockCollection as any,
            );

            expect(vi.mocked(dbDelete)).toHaveBeenCalledWith(mockTable, [
                "1",
                "2",
            ]);
            expect(mockCollection.utils.writeDelete).toHaveBeenCalledWith("1");
            expect(mockCollection.utils.writeDelete).toHaveBeenCalledWith("2");
            expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
            expect(result).toEqual({ refetch: false });
        });

        it("should show error toast and throw on delete failure", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [{ key: "1" }],
            };
            const mockCollection = {
                utils: {
                    writeDelete: vi.fn(),
                },
            };
            const mockError = new Error("Delete failed");

            vi.mocked(dbDelete).mockRejectedValue(mockError);

            await expect(
                collectionOnDelete(
                    mockTable,
                    mockTransaction as any,
                    mockCollection as any,
                ),
            ).rejects.toThrow("Delete failed");

            expect(vi.mocked(dbDelete)).toHaveBeenCalledWith(mockTable, ["1"]);
            expect(mockCollection.utils.writeDelete).not.toHaveBeenCalled();
            expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
                "Failed to delete records.",
            );
        });
    });

    describe("collectionOnInsert", () => {
        it("should insert items and update collection on success", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [
                    { modified: { id: "1", name: "John" } },
                    { modified: { id: "2", name: "Jane" } },
                ],
            };
            const mockCollection = {
                utils: {
                    writeUpsert: vi.fn(),
                },
            };
            const serverItems = [
                { id: "1", name: "John", created_at: new Date() },
                { id: "2", name: "Jane", created_at: new Date() },
            ];

            vi.mocked(dbInsert).mockResolvedValue(serverItems);

            const result = await collectionOnInsert(
                mockTable,
                mockTransaction as any,
                mockCollection as any,
            );

            expect(vi.mocked(dbInsert)).toHaveBeenCalledWith(mockTable, [
                { id: "1", name: "John" },
                { id: "2", name: "Jane" },
            ]);
            expect(mockCollection.utils.writeUpsert).toHaveBeenCalledWith(
                serverItems[0],
            );
            expect(mockCollection.utils.writeUpsert).toHaveBeenCalledWith(
                serverItems[1],
            );
            expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
            expect(result).toEqual({ refetch: false });
        });

        it("should show error toast and throw on insert failure", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [{ modified: { name: "John" } }],
            };
            const mockCollection = {
                utils: {
                    writeUpsert: vi.fn(),
                },
            };
            const mockError = new Error("Insert failed");

            vi.mocked(dbInsert).mockRejectedValue(mockError);

            await expect(
                collectionOnInsert(
                    mockTable,
                    mockTransaction as any,
                    mockCollection as any,
                ),
            ).rejects.toThrow("Insert failed");

            expect(vi.mocked(dbInsert)).toHaveBeenCalledWith(mockTable, [{
                name: "John",
            }]);
            expect(mockCollection.utils.writeUpsert).not.toHaveBeenCalled();
            expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
                "Failed to create records.",
            );
        });
    });

    describe("collectionOnUpdate", () => {
        it("should update items and update collection on success", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [
                    {
                        key: "1",
                        changes: { name: "John Updated" },
                        original: { id: "1", name: "John" },
                    },
                ],
            };
            const mockCollection = {
                utils: {
                    writeUpsert: vi.fn(),
                },
            };
            const serverResponses = [
                {
                    data: {
                        id: "1",
                        name: "John Updated",
                        updated_at: new Date(),
                    },
                    error: null,
                },
            ];

            vi.mocked(dbUpdate).mockResolvedValue(serverResponses);

            const result = await collectionOnUpdate(
                mockTable,
                mockTransaction as any,
                mockCollection as any,
            );

            expect(vi.mocked(dbUpdate)).toHaveBeenCalledWith(mockTable, [
                { id: "1", changes: { name: "John Updated" } },
            ]);
            expect(mockCollection.utils.writeUpsert).toHaveBeenCalledWith(
                serverResponses[0].data,
            );
            expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
            expect(result).toEqual({ refetch: false });
        });

        it("should handle partial update failures with granular rollback", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [
                    {
                        key: "1",
                        changes: { name: "John Updated" },
                        original: { id: "1", name: "John" },
                    },
                    {
                        key: "2",
                        changes: { name: "Jane Updated" },
                        original: { id: "2", name: "Jane" },
                    },
                ],
            };
            const mockCollection = {
                utils: {
                    writeUpsert: vi.fn(),
                },
            };
            const serverResponses = [
                {
                    data: { id: "1", name: "John Updated" },
                    error: null,
                },
                {
                    data: null,
                    error: new Error("Update failed for Jane"),
                },
            ];

            vi.mocked(dbUpdate).mockResolvedValue(serverResponses);

            const result = await collectionOnUpdate(
                mockTable,
                mockTransaction as any,
                mockCollection as any,
            );

            expect(vi.mocked(dbUpdate)).toHaveBeenCalledWith(mockTable, [
                { id: "1", changes: { name: "John Updated" } },
                { id: "2", changes: { name: "Jane Updated" } },
            ]);
            expect(mockCollection.utils.writeUpsert).toHaveBeenCalledWith(
                serverResponses[0].data,
            );
            expect(mockCollection.utils.writeUpsert).toHaveBeenCalledWith(
                mockTransaction.mutations[1].original,
            );
            expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
                "Some updates failed. Changes have been rolled back.",
            );
            expect(result).toEqual({ refetch: false });
        });

        it("should handle complete update failure", async () => {
            const mockTable = "employees";
            const mockTransaction = {
                mutations: [
                    {
                        key: "1",
                        changes: { name: "John Updated" },
                        original: { id: "1", name: "John" },
                    },
                ],
            };
            const mockCollection = {
                utils: {
                    writeUpsert: vi.fn(),
                },
            };

            vi.mocked(dbUpdate).mockRejectedValue(new Error("Network error"));

            await expect(
                collectionOnUpdate(
                    mockTable,
                    mockTransaction as any,
                    mockCollection as any,
                ),
            ).rejects.toThrow("Network error");

            expect(vi.mocked(dbUpdate)).toHaveBeenCalledWith(mockTable, [
                { id: "1", changes: { name: "John Updated" } },
            ]);
            expect(mockCollection.utils.writeUpsert).not.toHaveBeenCalled();
            expect(vi.mocked(toast.error)).not.toHaveBeenCalled(); // Error is thrown, not handled here
        });
    });
});
