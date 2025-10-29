import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 0,
        },
    },
});

vi.mock("@/integrations/tanstack-query/root-provider", () => ({
    getContext: () => ({
        queryClient: testQueryClient,
    }),
}));

const mockToastError = vi.fn();
vi.mock("sonner", () => ({
    toast: {
        error: mockToastError,
    },
}));

vi.mock("../client", () => ({
    supabase: {
        from: vi.fn(),
    },
}));

import { supabase } from "../client";
import type { Employee, Timesheet } from "../data-types";

describe("Collection E2E Tests", () => {
    let mockSupabase: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        testQueryClient.clear();
        mockSupabase = vi.mocked(supabase);
        mockToastError.mockClear();
    });

    describe("Collection Instantiation", () => {
        it("should instantiate employees collection (whole collection)", async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            const { employees } = await import("../collections/employees");

            expect(employees).toBeDefined();
            expect(typeof employees).toBe("object");
            expect(employees.insert).toBeDefined();
            expect(employees.update).toBeDefined();
            expect(employees.delete).toBeDefined();
        });

        it("should instantiate timesheets collection (partitioned collection)", async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            });

            const { timesheets } = await import("../collections/timesheets");
            const collection = timesheets(2023);

            expect(collection).toBeDefined();
            expect(typeof collection).toBe("object");
            expect(collection.insert).toBeDefined();
            expect(collection.update).toBeDefined();
            expect(collection.delete).toBeDefined();
        });
    });

    describe("Partitioned Collection Caching", () => {
        it("should cache partitioned collections by year", async () => {
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            });

            const { timesheets } = await import("../collections/timesheets");

            const collection2023a = timesheets(2023);
            const collection2023b = timesheets(2023);
            const collection2024 = timesheets(2024);

            expect(collection2023a).toBe(collection2023b);
            expect(collection2023a).not.toBe(collection2024);
        });
    });

    describe("Optimistic Operations - Employees (Whole Collection)", () => {
        it("should handle optimistic insert successfully", async () => {
            const newEmployee: Partial<Employee> = {
                id: "temp-1",
                first_name: "Jane",
                last_name: "Smith",
                email_address: "jane@example.com",
                birth_date: new Date("1990-01-01"),
                home_address: "456 Oak St",
                ssn_hash: "hash2",
            };

            const serverResponse = {
                id: "server-1",
                first_name: "Jane",
                last_name: "Smith",
                email_address: "jane@example.com",
                birth_date: "1990-01-01",
                home_address: "456 Oak St",
                ssn_hash: "hash2",
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                cell_phone: null,
                created_by: null,
                csc_id: null,
                home_phone: null,
                is_default_cto: false,
                mailing_address: null,
                middle_name: null,
                pers_membership_number: null,
                pers_tier: null,
                photo_url: null,
                user_id: null,
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            const { employees } = await import("../collections/employees");

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: [serverResponse],
                        error: null,
                    }),
                }),
            });

            await employees.insert(newEmployee as Employee);
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(mockSupabase.from).toHaveBeenCalledWith("employees");
        });

        it("should handle optimistic insert failure and rollback", async () => {
            const newEmployee: Partial<Employee> = {
                id: "temp-2",
                first_name: "Jane",
                last_name: "Smith",
                email_address: "jane@example.com",
                birth_date: new Date("1990-01-01"),
                home_address: "456 Oak St",
                ssn_hash: "hash2",
            };

            // Mock initial data fetch (empty collection)
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            const { employees } = await import("../collections/employees");

            // Wait for initial load
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Now mock insert failure
            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "Insert failed" },
                    }),
                }),
            });

            // Insert and wait for error toast
            employees.insert(newEmployee as Employee);
            await new Promise((resolve) => setTimeout(resolve, 200));

            expect(mockToastError).toHaveBeenCalled();
        });

        it("should handle optimistic delete failure and rollback", async () => {
            const existingEmployee = {
                id: "1",
                first_name: "John",
                last_name: "Doe",
                email_address: "john@example.com",
                birth_date: "1990-01-01",
                home_address: "123 Main St",
                ssn_hash: "hash1",
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                cell_phone: null,
                created_by: null,
                csc_id: null,
                home_phone: null,
                is_default_cto: false,
                mailing_address: null,
                middle_name: null,
                pers_membership_number: null,
                pers_tier: null,
                photo_url: null,
                user_id: null,
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [existingEmployee],
                    error: null,
                }),
            });

            const { employees } = await import("../collections/employees");

            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "Delete failed" },
                    }),
                }),
            });

            let errorThrown = false;
            try {
                await employees.delete("1");
            } catch (error) {
                errorThrown = true;
            }

            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(errorThrown).toBe(true);
        });
    });

    describe("Optimistic Operations - Timesheets (Partitioned Collection)", () => {
        it("should handle optimistic insert successfully", async () => {
            const newTimesheet: Partial<Timesheet> = {
                id: "temp-1",
                pay_period_id: "pp1",
                timesheet_date: new Date("2023-01-02"),
            };

            const serverResponse = {
                id: "server-1",
                pay_period_id: "pp1",
                timesheet_date: "2023-01-02",
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                created_by: null,
                holiday_date_id: null,
                modified_by: null,
                notes: null,
            };

            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            });

            const { timesheets } = await import("../collections/timesheets");
            const collection = timesheets(2023);

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: [serverResponse],
                        error: null,
                    }),
                }),
            });

            await collection.insert(newTimesheet as Timesheet);
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(mockSupabase.from).toHaveBeenCalledWith("timesheets");
        });

        it("should handle optimistic insert failure and rollback", async () => {
            const newTimesheet: Partial<Timesheet> = {
                id: "temp-2",
                pay_period_id: "pp1",
                timesheet_date: new Date("2023-01-02"),
            };

            // Mock initial data fetch (empty collection)
            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            });

            const { timesheets } = await import("../collections/timesheets");
            const collection = timesheets(2023);

            // Wait for initial load
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Now mock insert failure
            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "Insert failed" },
                    }),
                }),
            });

            // Insert and wait for error toast
            collection.insert(newTimesheet as Timesheet);
            await new Promise((resolve) => setTimeout(resolve, 200));

            expect(mockToastError).toHaveBeenCalled();
        });

        it("should handle optimistic delete failure and rollback", async () => {
            const existingTimesheet = {
                id: "1",
                pay_period_id: "pp1",
                timesheet_date: "2023-01-01",
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                created_by: null,
                holiday_date_id: null,
                modified_by: null,
                notes: null,
            };

            const mockSelect = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [existingTimesheet],
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValue({
                select: mockSelect,
            });

            const { timesheets } = await import("../collections/timesheets");
            const collection = timesheets(2023);

            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "Delete failed" },
                    }),
                }),
            });

            let errorThrown = false;
            try {
                await collection.delete("1");
            } catch (error) {
                errorThrown = true;
            }

            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(errorThrown).toBe(true);
        });
    });
});
