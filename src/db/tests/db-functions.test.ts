import { beforeEach, describe, expect, it, vi } from "vitest";
import { dbDelete, dbInsert, dbSelectAll, dbUpdate } from "../db-functions";
import { supabase } from "../client";
import { transformDatesApptoDB, transformDatesDBtoApp } from "../utils";

// Mock the supabase client
vi.mock("../client", () => ({
    supabase: {
        from: vi.fn(),
    },
}));

// Mock the utils
vi.mock("../utils", () => ({
    transformDatesDBtoApp: vi.fn(),
    transformDatesApptoDB: vi.fn(),
}));

describe("db-functions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("dbSelectAll", () => {
        it("should fetch all data and transform dates", async () => {
            const mockTable = "employees";
            const mockData = [
                {
                    id: "1",
                    first_name: "John",
                    created_at: "2023-01-01T00:00:00Z",
                },
                {
                    id: "2",
                    first_name: "Jane",
                    created_at: "2023-01-02T00:00:00Z",
                },
            ];
            const transformedData = [
                {
                    id: "1",
                    first_name: "John",
                    created_at: new Date("2023-01-01T00:00:00Z"),
                },
                {
                    id: "2",
                    first_name: "Jane",
                    created_at: new Date("2023-01-02T00:00:00Z"),
                },
            ];

            // Mock the chain
            const mockSelect = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });
            vi.mocked(supabase.from).mockReturnValue({
                select: mockSelect,
            } as any);

            vi.mocked(transformDatesDBtoApp).mockImplementation((
                data: any,
            ) => ({
                ...data,
                created_at: new Date(data.created_at),
            }));

            const result = await dbSelectAll(mockTable);

            expect(vi.mocked(supabase.from)).toHaveBeenCalledWith(mockTable);
            expect(mockSelect).toHaveBeenCalledWith("*");
            expect(vi.mocked(transformDatesDBtoApp)).toHaveBeenCalledTimes(2);
            expect(result).toEqual(transformedData);
        });

        it("should throw error if supabase returns error", async () => {
            const mockTable = "employees";
            const mockError = new Error("Database error");

            const mockSelect = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });
            vi.mocked(supabase.from).mockReturnValue({
                select: mockSelect,
            } as any);

            await expect(dbSelectAll(mockTable)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("dbInsert", () => {
        it("should insert data and transform dates", async () => {
            const mockTable = "employees";
            const items = [
                {
                    first_name: "John",
                    created_at: new Date("2023-01-01T00:00:00Z"),
                },
            ];
            const transformedItems = [
                { first_name: "John", created_at: "2023-01-01T00:00:00.000Z" },
            ];
            const mockData = [
                {
                    id: "1",
                    first_name: "John",
                    created_at: "2023-01-01T00:00:00Z",
                },
            ];
            const transformedData = [
                {
                    id: "1",
                    first_name: "John",
                    created_at: new Date("2023-01-01T00:00:00Z"),
                },
            ];

            vi.mocked(transformDatesApptoDB).mockReturnValue(
                transformedItems[0] as any,
            );
            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });
            mockInsert.mockReturnValue({ select: mockSelect });
            vi.mocked(supabase.from).mockReturnValue({
                insert: mockInsert,
            } as any);

            vi.mocked(transformDatesDBtoApp).mockReturnValue(
                transformedData[0] as any,
            );

            const result = await dbInsert(mockTable, items as any);

            expect(vi.mocked(supabase.from)).toHaveBeenCalledWith(mockTable);
            expect(mockInsert).toHaveBeenCalledWith(transformedItems);
            expect(mockSelect).toHaveBeenCalledWith("*");
            expect(vi.mocked(transformDatesApptoDB)).toHaveBeenCalledWith(
                items[0],
            );
            expect(result).toEqual(transformedData);
        });

        it("should throw error if insert fails", async () => {
            const mockTable = "employees";
            const items = [{ first_name: "John" }];
            const mockError = new Error("Insert error");

            vi.mocked(transformDatesApptoDB).mockReturnValue(items[0] as any);
            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });
            mockInsert.mockReturnValue({ select: mockSelect });
            vi.mocked(supabase.from).mockReturnValue({
                insert: mockInsert,
            } as any);

            await expect(dbInsert(mockTable, items as any)).rejects.toThrow(
                "Insert error",
            );
        });
    });

    describe("dbUpdate", () => {
        it("should update data and transform dates", async () => {
            const mockTable = "employees";
            const items = [
                {
                    id: "1",
                    changes: {
                        first_name: "John Updated",
                        modified_at: new Date("2023-01-02T00:00:00Z"),
                    },
                },
            ];
            const transformedChanges = {
                first_name: "John Updated",
                modified_at: "2023-01-02T00:00:00.000Z",
            };
            const mockData = [
                {
                    id: "1",
                    first_name: "John Updated",
                    modified_at: "2023-01-02T00:00:00Z",
                },
            ];
            const transformedData = [
                {
                    id: "1",
                    first_name: "John Updated",
                    modified_at: new Date("2023-01-02T00:00:00Z"),
                },
            ];

            vi.mocked(transformDatesApptoDB).mockReturnValue(
                transformedChanges as any,
            );
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockResolvedValue({
                data: mockData,
                error: null,
            });
            mockUpdate.mockReturnValue({ eq: mockEq });
            mockEq.mockReturnValue({ select: mockSelect });
            vi.mocked(supabase.from).mockReturnValue({
                update: mockUpdate,
            } as any);

            vi.mocked(transformDatesDBtoApp).mockReturnValue(
                transformedData[0] as any,
            );

            const result = await dbUpdate(mockTable, items as any);

            expect(vi.mocked(supabase.from)).toHaveBeenCalledWith(mockTable);
            expect(mockUpdate).toHaveBeenCalledWith(transformedChanges);
            expect(mockEq).toHaveBeenCalledWith("id", "1");
            expect(mockSelect).toHaveBeenCalledWith();
            expect(vi.mocked(transformDatesApptoDB)).toHaveBeenCalledWith(
                items[0].changes,
            );
            expect(result).toEqual([{ data: transformedData[0], error: null }]);
        });

        it("should handle update error", async () => {
            const mockTable = "employees";
            const items = [{ id: "1", changes: { first_name: "John" } }];
            const mockError = new Error("Update error");

            vi.mocked(transformDatesApptoDB).mockReturnValue(
                items[0].changes as any,
            );
            const mockUpdate = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
            });
            mockUpdate.mockReturnValue({ eq: mockEq });
            mockEq.mockReturnValue({ select: mockSelect });
            vi.mocked(supabase.from).mockReturnValue({
                update: mockUpdate,
            } as any);

            const result = await dbUpdate(mockTable, items as any);

            expect(result).toEqual([{ data: null, error: mockError }]);
        });
    });

    describe("dbDelete", () => {
        it("should delete data by ids", async () => {
            const mockTable = "employees";
            const keys = ["1", "2"];

            const mockDelete = vi.fn().mockReturnThis();
            const mockIn = vi.fn().mockResolvedValue({ error: null });
            mockDelete.mockReturnValue({ in: mockIn });
            vi.mocked(supabase.from).mockReturnValue({
                delete: mockDelete,
            } as any);

            await dbDelete(mockTable, keys);

            expect(vi.mocked(supabase.from)).toHaveBeenCalledWith(mockTable);
            expect(mockDelete).toHaveBeenCalledWith();
            expect(mockIn).toHaveBeenCalledWith("id", keys);
        });

        it("should throw error if delete fails", async () => {
            const mockTable = "employees";
            const keys = ["1"];
            const mockError = new Error("Delete error");

            const mockDelete = vi.fn().mockReturnThis();
            const mockIn = vi.fn().mockResolvedValue({ error: mockError });
            mockDelete.mockReturnValue({ in: mockIn });
            vi.mocked(supabase.from).mockReturnValue({
                delete: mockDelete,
            } as any);

            await expect(dbDelete(mockTable, keys)).rejects.toThrow(
                "Delete error",
            );
        });
    });
});
