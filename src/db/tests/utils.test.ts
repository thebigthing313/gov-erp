import { describe, expect, it } from "vitest";
import { transformDatesApptoDB, transformDatesDBtoApp } from "../utils";

describe("utils", () => {
    describe("transformDatesDBtoApp", () => {
        it("should transform _date fields from string to Date", () => {
            const input = {
                id: "1",
                birth_date: "1990-01-01",
                created_at: "2023-01-01T12:00:00Z",
                name: "John",
            };
            const result = transformDatesDBtoApp(input as any) as any;

            expect(result.birth_date).toBeInstanceOf(Date);
            expect(result.birth_date.toISOString()).toBe(
                "1990-01-01T00:00:00.000Z",
            );
            expect(result.created_at).toBeInstanceOf(Date);
            expect(result.created_at.toISOString()).toBe(
                "2023-01-01T12:00:00.000Z",
            );
            expect(result.id).toBe("1");
            expect(result.name).toBe("John");
        });

        it("should transform _at fields from string to Date", () => {
            const input = {
                id: "1",
                updated_at: "2023-01-02T14:30:00Z",
                modified_at: "2023-01-02T15:00:00Z",
            };
            const result = transformDatesDBtoApp(input as any) as any;

            expect(result.updated_at).toBeInstanceOf(Date);
            expect(result.updated_at.toISOString()).toBe(
                "2023-01-02T14:30:00.000Z",
            );
            expect(result.modified_at).toBeInstanceOf(Date);
            expect(result.modified_at.toISOString()).toBe(
                "2023-01-02T15:00:00.000Z",
            );
        });

        it("should not transform invalid date strings", () => {
            const input = {
                id: "1",
                invalid_date: "not-a-date",
                invalid_at: "also-not-a-date",
            };
            const result = transformDatesDBtoApp(input as any) as any;

            expect(result.invalid_date).toBe("not-a-date");
            expect(result.invalid_at).toBe("also-not-a-date");
        });

        it("should not transform non-date fields", () => {
            const input = {
                id: "1",
                name: "John",
                age: 30,
                active: true,
            };
            const result = transformDatesDBtoApp(input as any) as any;

            expect(result).toEqual(input);
        });

        it("should handle null input", () => {
            const result = transformDatesDBtoApp(null as any);
            expect(result).toBeNull();
        });

        it("should handle undefined input", () => {
            const result = transformDatesDBtoApp(undefined as any);
            expect(result).toBeUndefined();
        });

        it("should handle array input", () => {
            const input = [{ id: "1" }];
            const result = transformDatesDBtoApp(input as any);
            expect(result).toEqual(input);
        });

        it("should handle empty object", () => {
            const input = {};
            const result = transformDatesDBtoApp(input as any) as any;
            expect(result).toEqual(input);
        });
    });

    describe("transformDatesApptoDB", () => {
        it("should transform Date objects to ISO strings", () => {
            const date1 = new Date("1990-01-01T00:00:00.000Z");
            const date2 = new Date("2023-01-01T12:00:00.000Z");
            const input = {
                id: "1",
                birth_date: date1,
                created_at: date2,
                name: "John",
            };
            const result = transformDatesApptoDB(input as any) as any;

            expect(result.birth_date).toBe("1990-01-01T00:00:00.000Z");
            expect(result.created_at).toBe("2023-01-01T12:00:00.000Z");
            expect(result.id).toBe("1");
            expect(result.name).toBe("John");
        });

        it("should not transform non-Date fields", () => {
            const input = {
                id: "1",
                name: "John",
                age: 30,
                active: true,
            };
            const result = transformDatesApptoDB(input as any) as any;

            expect(result).toEqual(input);
        });

        it("should handle null input", () => {
            const result = transformDatesApptoDB(null as any);
            expect(result).toBeNull();
        });

        it("should handle undefined input", () => {
            const result = transformDatesApptoDB(undefined as any);
            expect(result).toBeUndefined();
        });

        it("should handle array input", () => {
            const input = [{ id: "1" }];
            const result = transformDatesApptoDB(input as any);
            expect(result).toEqual(input);
        });

        it("should handle empty object", () => {
            const input = {};
            const result = transformDatesApptoDB(input as any) as any;
            expect(result).toEqual(input);
        });

        it("should handle partial records", () => {
            const input = {
                birth_date: new Date("1990-01-01T00:00:00.000Z"),
            };
            const result = transformDatesApptoDB(input as any) as any;

            expect(result.birth_date).toBe("1990-01-01T00:00:00.000Z");
        });
    });
});
