import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import type { Database } from "../supabase-types";

type Table = keyof Database["public"]["Tables"];

function generate(table: Table) {
    console.log("Generating schema for", table);
    const supabaseTypesPath = path.join(
        process.cwd(),
        "src/db/supabase-types.ts",
    );

    const program = ts.createProgram([supabaseTypesPath], {});
    const sourceFile = program.getSourceFile(supabaseTypesPath);
    if (!sourceFile) throw new Error("Could not parse supabase-types.ts");

    const enums = getEnums(sourceFile);
    const { row: rowFields, insert: insertFields } = getTableFields(
        sourceFile,
        table,
    );

    // Detect which audit fields exist in the table (excluding id)
    const auditFields = [
        "created_at",
        "created_by",
        "modified_at",
        "modified_by",
    ];
    const existingAuditFields = auditFields.filter((field) =>
        field in rowFields
    );

    // generate Zod Row with audit fields marked as optional
    const zodRow = generateZod(rowFields, existingAuditFields, enums);

    // Generate Insert schema with correct optional fields
    const zodInsert = generateZodInsert(
        insertFields,
        existingAuditFields,
        enums,
    );

    // Generate DB format schemas (convert Date back to string)
    const zodRowToDb = generateZodToDb(rowFields, existingAuditFields, enums);
    const zodInsertToDb = generateZodInsertToDb(
        insertFields,
        existingAuditFields,
        enums,
    );

    const imports = getImports(rowFields);
    const importLine = imports
        ? `import { ${imports} } from './fields';\n`
        : "";

    // write the file
    const pascalName = toPascalCase(table);
    const output = `// Auto-generated schema file for ${table} table
// Generated on: ${new Date().toISOString()}
//
// IMPORTANT: Automatic preprocessing is enabled for date fields:
// - Fields ending in '_at' (timestamps): ISO strings are automatically converted to Date objects
// - Fields ending in '_date' (dates): Date strings are automatically converted to Date objects (UTC)
//
// You can validate data directly without manual transformation:
//   const validated = Zod${pascalName}Row.parse(dataFromSupabase);

import z from 'zod';
${importLine}
export const Zod${pascalName}Row = z.object({
${zodRow}
});

export const Zod${pascalName}Insert = z.object({
${zodInsert}
});

export const Zod${pascalName}Update = Zod${pascalName}Insert.partial();

// Schemas for converting back to database format (Date -> ISO string)
export const Zod${pascalName}RowToDb = z.object({
${zodRowToDb}
});

export const Zod${pascalName}InsertToDb = z.object({
${zodInsertToDb}
});

export const Zod${pascalName}UpdateToDb = Zod${pascalName}InsertToDb.partial();

export type Zod${pascalName}RowType = z.infer<typeof Zod${pascalName}Row>;
export type Zod${pascalName}InsertType = z.infer<typeof Zod${pascalName}Insert>;
export type Zod${pascalName}UpdateType = z.infer<typeof Zod${pascalName}Update>;
export type Zod${pascalName}RowToDbType = z.infer<typeof Zod${pascalName}RowToDb>;
export type Zod${pascalName}InsertToDbType = z.infer<typeof Zod${pascalName}InsertToDb>;
export type Zod${pascalName}UpdateToDbType = z.infer<typeof Zod${pascalName}UpdateToDb>;
`;

    const outputFile = `src/db/schemas/${table}.ts`;
    fs.writeFileSync(path.join(process.cwd(), outputFile), output);
}

function getEnums(sourceFile: ts.SourceFile): Record<string, string[]> {
    const enums: Record<string, string[]> = {};
    function visit(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === "Database") {
            if (node.type && ts.isTypeLiteralNode(node.type)) {
                ts.forEachChild(node.type, visitDatabase);
            }
        }
        ts.forEachChild(node, visit);
    }
    function visitDatabase(node: ts.Node) {
        if (
            ts.isPropertySignature(node) && ts.isIdentifier(node.name) &&
            node.name.text === "public"
        ) {
            if (node.type && ts.isTypeLiteralNode(node.type)) {
                ts.forEachChild(node.type, visitPublic);
            }
        }
    }
    function visitPublic(node: ts.Node) {
        if (
            ts.isPropertySignature(node) && ts.isIdentifier(node.name) &&
            node.name.text === "Enums"
        ) {
            if (node.type && ts.isTypeLiteralNode(node.type)) {
                for (const enumMember of node.type.members) {
                    if (
                        ts.isPropertySignature(enumMember) &&
                        ts.isIdentifier(enumMember.name)
                    ) {
                        const enumName = enumMember.name.text;
                        if (
                            enumMember.type &&
                            ts.isUnionTypeNode(enumMember.type)
                        ) {
                            const values: string[] = [];
                            for (const unionType of enumMember.type.types) {
                                if (
                                    ts.isLiteralTypeNode(unionType) &&
                                    ts.isStringLiteral(unionType.literal)
                                ) {
                                    values.push(unionType.literal.text);
                                }
                            }
                            enums[enumName] = values;
                        }
                    }
                }
            }
        }
    }
    visit(sourceFile);
    return enums;
}

function getTableFields(
    sourceFile: ts.SourceFile,
    table: string,
): {
    row: Record<string, { type: string; optional: boolean }>;
    insert: Record<string, { type: string; optional: boolean }>;
} {
    let rowFields: Record<string, { type: string; optional: boolean }> = {};
    let insertFields: Record<string, { type: string; optional: boolean }> = {};
    function visit(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === "Database") {
            if (node.type && ts.isTypeLiteralNode(node.type)) {
                ts.forEachChild(node.type, visitDatabase);
            }
        }
        ts.forEachChild(node, visit);
    }
    function visitDatabase(node: ts.Node) {
        if (
            ts.isPropertySignature(node) && ts.isIdentifier(node.name) &&
            node.name.text === "public"
        ) {
            if (node.type && ts.isTypeLiteralNode(node.type)) {
                ts.forEachChild(node.type, visitPublic);
            }
        }
    }
    function visitPublic(node: ts.Node) {
        if (
            ts.isPropertySignature(node) && ts.isIdentifier(node.name) &&
            node.name.text === "Tables"
        ) {
            if (node.type && ts.isTypeLiteralNode(node.type)) {
                for (const tableMember of node.type.members) {
                    if (
                        ts.isPropertySignature(tableMember) &&
                        ts.isIdentifier(tableMember.name) &&
                        tableMember.name.text === table
                    ) {
                        if (
                            tableMember.type &&
                            ts.isTypeLiteralNode(tableMember.type)
                        ) {
                            for (const subMember of tableMember.type.members) {
                                if (
                                    ts.isPropertySignature(subMember) &&
                                    ts.isIdentifier(subMember.name)
                                ) {
                                    const subName = subMember.name.text;
                                    if (subName === "Row") {
                                        rowFields = parseTypeLiteral(
                                            subMember
                                                .type as ts.TypeLiteralNode,
                                            sourceFile,
                                        );
                                    } else if (subName === "Insert") {
                                        insertFields = parseTypeLiteral(
                                            subMember
                                                .type as ts.TypeLiteralNode,
                                            sourceFile,
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    visit(sourceFile);
    return { row: rowFields, insert: insertFields };
}

function parseTypeLiteral(
    typeLiteral: ts.TypeLiteralNode,
    sourceFile: ts.SourceFile,
): Record<string, { type: string; optional: boolean }> {
    const fields: Record<string, { type: string; optional: boolean }> = {};
    const printer = ts.createPrinter();
    for (const member of typeLiteral.members) {
        if (
            ts.isPropertySignature(member) && member.name &&
            ts.isIdentifier(member.name)
        ) {
            const field = member.name.text;
            const optional = !!member.questionToken;
            const typeStr = member.type
                ? printer.printNode(
                    ts.EmitHint.Unspecified,
                    member.type,
                    sourceFile,
                )
                : "unknown";
            fields[field] = { type: typeStr, optional };
        }
    }
    return fields;
}

function generateZod(
    fields: Record<string, { type: string; optional: boolean }>,
    auditFieldsToMarkOptional: string[],
    enums: Record<string, string[]>,
): string {
    const lines = [];
    for (const [field, { type }] of Object.entries(fields)) {
        let zodType = mapTypeToZod(field, type, enums);
        // Mark audit fields as optional (for TanStack DB persistence handler)
        if (auditFieldsToMarkOptional.includes(field)) {
            zodType += ".optional()";
        }
        lines.push(`\t${field}: ${zodType},`);
    }
    return lines.join("\n");
}

function generateZodInsert(
    insertFields: Record<string, { type: string; optional: boolean }>,
    auditFieldsToOmit: string[],
    enums: Record<string, string[]>,
): string {
    const lines = [];
    for (const [field, { type, optional }] of Object.entries(insertFields)) {
        // Skip audit fields that will be omitted
        if (auditFieldsToOmit.includes(field)) continue;

        let zodType = mapTypeToZod(field, type, enums);
        // Add .optional() for fields that are optional in Insert
        if (optional) {
            zodType += ".optional()";
        }
        lines.push(`\t${field}: ${zodType},`);
    }
    return lines.join("\n");
}

function generateZodToDb(
    fields: Record<string, { type: string; optional: boolean }>,
    auditFieldsToMarkOptional: string[],
    enums: Record<string, string[]>,
): string {
    const lines = [];
    for (const [field, { type }] of Object.entries(fields)) {
        let zodType = mapTypeToZodDb(field, type, enums);
        // Mark audit fields as optional (for TanStack DB persistence handler)
        if (auditFieldsToMarkOptional.includes(field)) {
            zodType += ".optional()";
        }
        lines.push(`\t${field}: ${zodType},`);
    }
    return lines.join("\n");
}

function generateZodInsertToDb(
    insertFields: Record<string, { type: string; optional: boolean }>,
    auditFieldsToOmit: string[],
    enums: Record<string, string[]>,
): string {
    const lines = [];
    for (const [field, { type, optional }] of Object.entries(insertFields)) {
        // Skip audit fields that will be omitted
        if (auditFieldsToOmit.includes(field)) continue;

        let zodType = mapTypeToZodDb(field, type, enums);
        // Add .optional() for fields that are optional in Insert
        if (optional) {
            zodType += ".optional()";
        }
        lines.push(`\t${field}: ${zodType},`);
    }
    return lines.join("\n");
}

function mapTypeToZod(
    field: string,
    type: string,
    enums: Record<string, string[]>,
): string {
    const isNullable = type.includes("| null");

    // Handle enum types
    if (type.includes('Database["public"]["Enums"]')) {
        const enumName = type.match(/Enums"\]\["([^"]+)"/)?.[1];
        if (enumName && enums[enumName]) {
            const base = `z.enum([${
                enums[enumName].map((v) => `"${v}"`).join(", ")
            }])`;
            return isNullable ? `${base}.nullable()` : base;
        } else {
            return isNullable ? "z.string().nullable()" : "z.string()";
        }
    }

    // Handle timestamp fields (*_at) - ISO strings from Supabase, Date in app
    if (field.match(/_at$/)) {
        const base =
            'z.preprocess((val) => typeof val === "string" ? new Date(val) : val, z.date())';
        return isNullable ? `${base}.nullable()` : base;
    }

    // Handle date fields (*_date) - ISO strings from Supabase, Date in app
    if (field.match(/_date$/)) {
        const base =
            'z.preprocess((val) => typeof val === "string" ? new Date(val.includes("T") ? val : `$' +
            "{val}T00:00:00Z`) : val, z.date())";
        return isNullable ? `${base}.nullable()` : base;
    }

    // Handle UUID fields (id, *_id, *_by)
    if (field === "id" || field.match(/_id$/) || field.match(/_by$/)) {
        return isNullable ? "z.uuid().nullable()" : "z.uuid()";
    }

    // Handle URL fields
    if (field.includes("url")) {
        return isNullable ? "z.url().nullable()" : "z.url()";
    } // Handle email fields
    if (field.includes("email")) {
        return isNullable ? "EmailSchema.nullable()" : "EmailSchema";
    }

    // Handle phone fields
    if (field.includes("phone")) {
        return isNullable
            ? "PhoneNumberSchema.nullable()"
            : "PhoneNumberSchema";
    }

    // Handle primitive types
    if (type === "string" || type === "string | null") {
        return isNullable ? "z.string().nullable()" : "z.string()";
    }

    if (type === "number" || type === "number | null") {
        return isNullable ? "z.number().nullable()" : "z.number()";
    }

    if (type === "boolean" || type === "boolean | null") {
        return isNullable ? "z.boolean().nullable()" : "z.boolean()";
    }

    if (type === "Json" || type === "Json | null") {
        return isNullable ? "z.any().nullable()" : "z.any()";
    }

    // Default fallback
    return isNullable ? "z.string().nullable()" : "z.string()";
}

function mapTypeToZodDb(
    field: string,
    type: string,
    enums: Record<string, string[]>,
): string {
    const isNullable = type.includes("| null");

    // Handle enum types
    if (type.includes('Database["public"]["Enums"]')) {
        const enumName = type.match(/Enums"\]\["([^"]+)"/)?.[1];
        if (enumName && enums[enumName]) {
            const base = `z.enum([${
                enums[enumName].map((v) => `"${v}"`).join(", ")
            }])`;
            return isNullable ? `${base}.nullable()` : base;
        } else {
            return isNullable ? "z.string().nullable()" : "z.string()";
        }
    }

    // Handle timestamp fields (*_at) - Date objects to ISO strings
    if (field.match(/_at$/)) {
        const base =
            "z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string())";
        return isNullable ? `${base}.nullable()` : base;
    }

    // Handle date fields (*_date) - Date objects to ISO date strings
    if (field.match(/_date$/)) {
        const base =
            'z.preprocess((val) => val instanceof Date ? val.toISOString().split("T")[0] : val, z.string())';
        return isNullable ? `${base}.nullable()` : base;
    }

    // Handle UUID fields (id, *_id, *_by)
    if (field === "id" || field.match(/_id$/) || field.match(/_by$/)) {
        return isNullable ? "z.uuid().nullable()" : "z.uuid()";
    }

    // Handle URL fields
    if (field.includes("url")) {
        return isNullable ? "z.url().nullable()" : "z.url()";
    }

    // Handle email fields
    if (field.includes("email")) {
        return isNullable ? "EmailSchema.nullable()" : "EmailSchema";
    }

    // Handle phone fields
    if (field.includes("phone")) {
        return isNullable
            ? "PhoneNumberSchema.nullable()"
            : "PhoneNumberSchema";
    }

    // Handle primitive types
    if (type === "string" || type === "string | null") {
        return isNullable ? "z.string().nullable()" : "z.string()";
    }

    if (type === "number" || type === "number | null") {
        return isNullable ? "z.number().nullable()" : "z.number()";
    }

    if (type === "boolean" || type === "boolean | null") {
        return isNullable ? "z.boolean().nullable()" : "z.boolean()";
    }

    if (type === "Json" || type === "Json | null") {
        return isNullable ? "z.any().nullable()" : "z.any()";
    }

    // Default fallback
    return isNullable ? "z.string().nullable()" : "z.string()";
}

function getImports(
    fields: Record<string, { type: string; optional: boolean }>,
): string {
    const imports = new Set<string>();
    for (const [field] of Object.entries(fields)) {
        if (field.includes("email")) imports.add("EmailSchema");
        if (field.includes("phone")) imports.add("PhoneNumberSchema");
    }
    return Array.from(imports).join(", ");
}

function toPascalCase(s: string): string {
    return s
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
}

// Main execution
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const table = process.argv[2] as Table;
    if (!table) {
        console.error("Usage: tsx src/db/schemas/code-gen.ts <table>");
        process.exit(1);
    }
    generate(table);
    console.log(`Generated schema for ${table}`);
}
