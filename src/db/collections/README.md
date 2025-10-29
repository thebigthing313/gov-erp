# Collection Factory Guide

A type-safe factory for creating TanStack Collections that integrate seamlessly with Supabase and Zod schemas.

## Overview

The `collection-factory.ts` provides two main functions:

1. **`createSupabaseCollection`** - For simple collections that fetch all records from a table
2. **`createParameterizedSupabaseCollectionFactory`** - For collections that need query parameters (filters, relations, etc.)

Both functions handle CRUD operations automatically and provide full type safety through Zod schemas.

## Prerequisites

You need three Zod schemas for each collection:

- **`rowSchema`** - Full item schema (read/output with server-generated fields)
- **`insertSchema`** - Client input for INSERT operations (audit fields optional/omitted)
- **`updateSchema`** - Client input for UPDATE operations (partial item)

## Basic Usage: Simple Collections

Use `createSupabaseCollection` when you need to fetch all records from a table without parameters.

### Example: Employees Collection

```typescript
import { createSupabaseCollection } from './collection-factory'
import {
  ZodEmployeesRow,
  ZodEmployeesRowType,
  ZodEmployeesInsertToDb,
  ZodEmployeesInsertToDbType,
  ZodEmployeesUpdateToDb,
  ZodEmployeesUpdateToDbType,
} from '../schemas/employees'

export const employees = createSupabaseCollection<
  ZodEmployeesRowType,
  ZodEmployeesInsertToDbType,
  ZodEmployeesUpdateToDbType
>(
  'employees',
  {
    rowSchema: ZodEmployeesRow,
    insertSchema: ZodEmployeesInsertToDb,
    updateSchema: ZodEmployeesUpdateToDb,
  },
  {
    staleTime: 1000 * 60 * 60, // 1 hour
  },
)
```

### Using the Collection

```typescript
import { employees } from "@/db/collections/employees";

function MyComponent() {
    // Access collection data
    const allEmployees = employees.data;

    // Insert new employee
    employees.insert({
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
    });

    // Update employee
    employees.update("employee-id-123", {
        email: "newemail@example.com",
    });

    // Delete employee
    employees.delete("employee-id-123");

    return <div>...</div>;
}
```

## Advanced Usage: Parameterized Collections

Use `createParameterizedSupabaseCollectionFactory` when you need to filter or customize the query based on parameters.

### Example: Employee Titles (Filtered by Employee ID)

```typescript
import { Collection } from '@tanstack/react-db'
import { createParameterizedSupabaseCollectionFactory } from './collection-factory'
import { supabase } from '../client'
import {
  ZodEmployeeTitlesRow,
  ZodEmployeeTitlesRowType,
  ZodEmployeeTitlesInsertToDb,
  ZodEmployeeTitlesInsertType,
  ZodEmployeeTitlesUpdateToDb,
  ZodEmployeeTitlesUpdateType,
} from '../schemas/employee_titles'

// Local cache for collection instances
const cache = new Map<
  string,
  Collection<ZodEmployeeTitlesRowType, string | number>
>()

// Create the factory
const employeeTitlesCollectionFactory =
  createParameterizedSupabaseCollectionFactory<
    [employee_id: string], // Parameter tuple type
    ZodEmployeeTitlesRowType,
    ZodEmployeeTitlesInsertType,
    ZodEmployeeTitlesUpdateType
  >(
    'employee_titles',
    {
      rowSchema: ZodEmployeeTitlesRow,
      insertSchema: ZodEmployeeTitlesInsertToDb,
      updateSchema: ZodEmployeeTitlesUpdateToDb,
    },
    // Custom query function with parameter
    async (employee_id) => {
      const { data, error } = await supabase
        .from('employee_titles')
        .select('*')
        .eq('employee_id', employee_id)

      if (error) throw error

      return data.map((item) => ZodEmployeeTitlesRow.parse(item))
    },
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  )

// Export function with caching
export const employee_titles = (employee_id: string) => {
  let collection = cache.get(employee_id)

  if (!collection) {
    collection = employeeTitlesCollectionFactory(employee_id)

    // Cleanup on collection destroy
    collection.on('status:change', ({ status }) => {
      if (status === 'cleaned-up') {
        cache.delete(employee_id)
      }
    })

    cache.set(employee_id, collection)
  }

  return collection
}
```

### Using Parameterized Collections

```typescript
import { employee_titles } from "@/db/collections/employee-titles";

function EmployeeTitlesView({ employeeId }: { employeeId: string }) {
    // Get collection for specific employee
    const titlesCollection = employee_titles(employeeId);
    const titles = titlesCollection.data;

    // Insert new title
    titlesCollection.insert({
        employee_id: employeeId,
        title_id: "title-123",
        start_date: new Date(),
    });

    // Update title
    titlesCollection.update("title-record-id", {
        end_date: new Date(),
    });

    return <div>...</div>;
}
```

## Configuration Options

Both factory functions accept a config object with TanStack Query options:

```typescript
{
    staleTime: 1000 * 60 * 60,  // How long data is considered fresh
    enabled: true,               // Whether query should run
    // ... other TanStack Query options
}
```

## How It Works

### Automatic CRUD Operations

The factory automatically handles:

1. **Read (Query)** - Fetches data from Supabase and parses with `rowSchema`
2. **Create (Insert)** - Validates with `insertSchema`, inserts to DB, updates local state
3. **Update** - Validates with `updateSchema`, updates in DB, syncs local state
4. **Delete** - Removes from DB and local state

### Type Safety Flow

```
Client Input → insertSchema/updateSchema → Supabase
Supabase Response → rowSchema → Type-safe TItem
```

### Optimistic Updates

All mutations are optimistic by default. The collection updates immediately, and if the server operation fails, it rolls back automatically.

## Best Practices

### 1. Cache Parameterized Collections

Always implement caching for parameterized collections to avoid creating duplicate instances:

```typescript
const cache = new Map<string, Collection<TItem, string | number>>()

export const myCollection = (param: string) => {
  let collection = cache.get(param)

  if (!collection) {
    collection = myCollectionFactory(param)

    collection.on('status:change', ({ status }) => {
      if (status === 'cleaned-up') {
        cache.delete(param)
      }
    })

    cache.set(param, collection)
  }

  return collection
}
```

### 2. Define Schemas Carefully

Ensure your schemas match the actual database structure:

- `rowSchema` should include ALL fields (including audit fields)
- `insertSchema` should omit server-generated fields (id, created_at, etc.)
- `updateSchema` should be partial and omit immutable fields

### 3. Set Appropriate Stale Time

Choose stale time based on data volatility:

```typescript
{
    staleTime: 1000 * 60 * 60,      // 1 hour - for rarely changing data
    staleTime: 1000 * 60 * 5,       // 5 minutes - for frequently changing data
    staleTime: 0,                    // Always refetch
}
```

### 4. Complex Queries with Joins

For queries with joins or complex transformations, parse in your custom query function:

```typescript
;async (employee_id) => {
  const { data, error } = await supabase
    .from('employee_titles')
    .select(
      `
            *,
            title:titles(name, department)
        `,
    )
    .eq('employee_id', employee_id)

  if (error) throw error

  return data.map((item) => ZodEmployeeTitlesRow.parse(item))
}
```

## Troubleshooting

### Type Error: Generic Type Constraint

If you see: `Type 'TItem' does not satisfy the constraint 'object'`

**Solution**: Ensure your type parameter extends `object`:

```typescript
createSupabaseCollection<
    MyType extends object,  // ✓ Correct
    // ...
>
```

### Collection Not Updating

**Check**:

1. Are you using the same collection instance?
2. Is `refetch` set to `false` in mutation handlers?
3. Are audit fields being properly handled?

### Parse Errors

**Check**:

1. Schema matches actual Supabase structure
2. Date fields are properly transformed
3. Optional fields are marked with `.optional()`

## Migration from Direct Supabase Calls

**Before:**

```typescript
const { data } = await supabase.from('employees').select('*')
```

**After:**

```typescript
const data = employees.data
```

Benefits:

- ✓ Automatic caching
- ✓ Optimistic updates
- ✓ Type safety
- ✓ CRUD operations built-in
- ✓ React integration

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TanStack DB Docs](https://tanstack.com/db/latest)
- [Zod Documentation](https://zod.dev/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
