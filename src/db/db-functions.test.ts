import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { dbDelete, dbInsert, dbSelect, dbUpdate } from "./db-functions";

// Mock the supabase client
vi.mock("@/main", () => ({
    supabase: {
        from: vi.fn(),
    },
}));

import { supabase } from "@/main";

describe("dbSelect", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully select all records from a table", async () => {
        const mockData = [
            {
                id: "1",
                first_name: "John",
                last_name: "Doe",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
            },
            {
                id: "2",
                first_name: "Jane",
                last_name: "Smith",
                birth_date: "1992-05-15",
                home_address: "456 Oak Ave",
                ssn_hash: "hash2",
            },
        ];

        const mockSelect = vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
        });

        (supabase.from as Mock).mockReturnValue({
            select: mockSelect,
        });

        const result = await dbSelect("employees");

        expect(supabase.from).toHaveBeenCalledWith("employees");
        expect(mockSelect).toHaveBeenCalledWith("*");
        expect(result).toEqual(mockData);
    });

    it("should return empty array when no data is found", async () => {
        const mockSelect = vi.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        (supabase.from as Mock).mockReturnValue({
            select: mockSelect,
        });

        const result = await dbSelect("employees");

        expect(result).toEqual([]);
    });

    it("should throw error when database query fails", async () => {
        const mockError = new Error("Database connection failed");

        const mockSelect = vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
        });

        (supabase.from as Mock).mockReturnValue({
            select: mockSelect,
        });

        await expect(dbSelect("employees")).rejects.toThrow(
            "Database connection failed",
        );
    });
});

describe("dbInsert", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully insert single record", async () => {
        const mockInsertData = {
            first_name: "John",
            last_name: "Doe",
            birth_date: "1990-01-01",
            home_address: "123 Main St",
            ssn_hash: "hash1",
        };
        const mockReturnData = [
            {
                id: "1",
                first_name: "John",
                last_name: "Doe",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
                created_at: "2025-10-17",
            },
        ];

        const mockSelect = vi.fn().mockResolvedValue({
            data: mockReturnData,
            error: null,
        });

        const mockInsert = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        (supabase.from as Mock).mockReturnValue({
            insert: mockInsert,
        });

        const result = await dbInsert("employees", [mockInsertData]);

        expect(supabase.from).toHaveBeenCalledWith("employees");
        expect(mockInsert).toHaveBeenCalledWith([mockInsertData]);
        expect(mockSelect).toHaveBeenCalled();
        expect(result).toEqual(mockReturnData);
    });

    it("should successfully insert multiple records", async () => {
        const mockInsertData = [
            {
                first_name: "John",
                last_name: "Doe",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
            },
            {
                first_name: "Jane",
                last_name: "Smith",
                birth_date: "1992-05-15",
                home_address: "456 Oak Ave",
                ssn_hash: "hash2",
            },
        ];

        const mockReturnData = [
            {
                id: "1",
                first_name: "John",
                last_name: "Doe",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
                created_at: "2025-10-17",
            },
            {
                id: "2",
                first_name: "Jane",
                last_name: "Smith",
                birth_date: "1992-05-15",
                home_address: "456 Oak Ave",
                ssn_hash: "hash2",
                created_at: "2025-10-17",
            },
        ];

        const mockSelect = vi.fn().mockResolvedValue({
            data: mockReturnData,
            error: null,
        });

        const mockInsert = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        (supabase.from as Mock).mockReturnValue({
            insert: mockInsert,
        });

        const result = await dbInsert("employees", mockInsertData);

        expect(result).toHaveLength(2);
        expect(result).toEqual(mockReturnData);
    });

    it("should return empty array when insert returns null data", async () => {
        const mockSelect = vi.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const mockInsert = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        (supabase.from as Mock).mockReturnValue({
            insert: mockInsert,
        });

        const mockData = {
            first_name: "Test",
            last_name: "User",
            birth_date: "1990-01-01",
            home_address: "123 Test St",
            ssn_hash: "hash",
        };

        const result = await dbInsert("employees", [mockData]);

        expect(result).toEqual([]);
    });

    it("should throw error when insert fails", async () => {
        const mockError = new Error("Unique constraint violation");

        const mockSelect = vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        (supabase.from as Mock).mockReturnValue({
            insert: mockInsert,
        });

        const mockData = {
            first_name: "Test",
            last_name: "User",
            birth_date: "1990-01-01",
            home_address: "123 Test St",
            ssn_hash: "hash",
        };

        await expect(dbInsert("employees", [mockData])).rejects.toThrow(
            "Unique constraint violation",
        );
    });
});

describe("dbUpdate", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully update single record", async () => {
        const mockUpdates = [
            {
                id: "1",
                changes: { first_name: "Updated Name" },
            },
        ];

        const mockReturnData = [
            {
                id: "1",
                first_name: "Updated Name",
                last_name: "Doe",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
                created_at: "2025-10-17",
            },
        ];

        const mockSelect = vi.fn().mockResolvedValue({
            data: mockReturnData,
            error: null,
        });

        const mockEq = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        const mockUpdate = vi.fn().mockReturnValue({
            eq: mockEq,
        });

        (supabase.from as Mock).mockReturnValue({
            update: mockUpdate,
        });

        const result = await dbUpdate("employees", mockUpdates);

        expect(supabase.from).toHaveBeenCalledWith("employees");
        expect(mockUpdate).toHaveBeenCalledWith({ first_name: "Updated Name" });
        expect(mockEq).toHaveBeenCalledWith("id", "1");
        expect(mockSelect).toHaveBeenCalled();
        expect(result).toEqual(mockReturnData);
    });

    it("should successfully update multiple records", async () => {
        const mockUpdates = [
            { id: "1", changes: { first_name: "Updated 1" } },
            { id: "2", changes: { first_name: "Updated 2" } },
        ];

        const mockReturnData1 = [
            {
                id: "1",
                first_name: "Updated 1",
                last_name: "Doe",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
            },
        ];
        const mockReturnData2 = [
            {
                id: "2",
                first_name: "Updated 2",
                last_name: "Smith",
                birth_date: "1992-05-15",
                home_address: "456 Oak Ave",
                ssn_hash: "hash2",
            },
        ];

        let callCount = 0;
        const mockSelect = vi.fn().mockImplementation(() => {
            const data = callCount === 0 ? mockReturnData1 : mockReturnData2;
            callCount++;
            return Promise.resolve({ data, error: null });
        });

        const mockEq = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        const mockUpdate = vi.fn().mockReturnValue({
            eq: mockEq,
        });

        (supabase.from as Mock).mockReturnValue({
            update: mockUpdate,
        });

        const result = await dbUpdate("employees", mockUpdates);

        expect(result).toHaveLength(2);
        expect(result).toEqual([...mockReturnData1, ...mockReturnData2]);
        expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it("should handle empty data response", async () => {
        const mockUpdates = [
            { id: "1", changes: { first_name: "Updated" } },
        ];

        const mockSelect = vi.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const mockEq = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        const mockUpdate = vi.fn().mockReturnValue({
            eq: mockEq,
        });

        (supabase.from as Mock).mockReturnValue({
            update: mockUpdate,
        });

        const result = await dbUpdate("employees", mockUpdates);

        expect(result).toEqual([]);
    });

    it("should throw error when update fails", async () => {
        const mockError = new Error("Record not found");

        const mockSelect = vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
        });

        const mockEq = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        const mockUpdate = vi.fn().mockReturnValue({
            eq: mockEq,
        });

        (supabase.from as Mock).mockReturnValue({
            update: mockUpdate,
        });

        const mockUpdates = [{ id: "999", changes: { first_name: "Test" } }];

        await expect(dbUpdate("employees", mockUpdates)).rejects.toThrow(
            "Record not found",
        );
    });

    it("should handle partial update failures", async () => {
        const mockUpdates = [
            { id: "1", changes: { first_name: "Updated 1" } },
            { id: "2", changes: { first_name: "Updated 2" } },
        ];

        let callCount = 0;
        const mockSelect = vi.fn().mockImplementation(() => {
            if (callCount === 0) {
                callCount++;
                return Promise.resolve({
                    data: [
                        {
                            id: "1",
                            first_name: "Updated 1",
                            last_name: "Doe",
                            birth_date: "1990-01-01",
                            home_address: "123 Main St",
                            ssn_hash: "hash1",
                        },
                    ],
                    error: null,
                });
            } else {
                return Promise.resolve({
                    data: null,
                    error: new Error("Second update failed"),
                });
            }
        });

        const mockEq = vi.fn().mockReturnValue({
            select: mockSelect,
        });

        const mockUpdate = vi.fn().mockReturnValue({
            eq: mockEq,
        });

        (supabase.from as Mock).mockReturnValue({
            update: mockUpdate,
        });

        await expect(dbUpdate("employees", mockUpdates)).rejects.toThrow(
            "Second update failed",
        );
    });
});

describe("dbDelete", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should successfully delete single record", async () => {
        const mockIn = vi.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const mockDelete = vi.fn().mockReturnValue({
            in: mockIn,
        });

        (supabase.from as Mock).mockReturnValue({
            delete: mockDelete,
        });

        await dbDelete("employees", ["1"]);

        expect(supabase.from).toHaveBeenCalledWith("employees");
        expect(mockDelete).toHaveBeenCalled();
        expect(mockIn).toHaveBeenCalledWith("id", ["1"]);
    });

    it("should successfully delete multiple records", async () => {
        const mockIn = vi.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const mockDelete = vi.fn().mockReturnValue({
            in: mockIn,
        });

        (supabase.from as Mock).mockReturnValue({
            delete: mockDelete,
        });

        await dbDelete("employees", ["1", "2", "3"]);

        expect(mockIn).toHaveBeenCalledWith("id", ["1", "2", "3"]);
    });

    it("should throw error when delete fails", async () => {
        const mockError = new Error("Foreign key constraint violation");

        const mockIn = vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
        });

        const mockDelete = vi.fn().mockReturnValue({
            in: mockIn,
        });

        (supabase.from as Mock).mockReturnValue({
            delete: mockDelete,
        });

        await expect(dbDelete("employees", ["1"])).rejects.toThrow(
            "Foreign key constraint violation",
        );
    });

    it("should handle empty keys array", async () => {
        const mockIn = vi.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const mockDelete = vi.fn().mockReturnValue({
            in: mockIn,
        });

        (supabase.from as Mock).mockReturnValue({
            delete: mockDelete,
        });

        await dbDelete("employees", []);

        expect(mockIn).toHaveBeenCalledWith("id", []);
    });
});
