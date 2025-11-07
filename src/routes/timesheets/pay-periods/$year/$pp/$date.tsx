import { RenderTable } from '@/components/render-table'
import { Input } from '@/components/ui/input'
import { timesheet_employee_times } from '@/db/collections/timesheet_employee_times'
import { useEmployees } from '@/db/hooks/use-employees'
import { useTimeTypes } from '@/db/hooks/use-time-types'
import { useTimesheetEmployeeTimes } from '@/db/hooks/use-timesheet-employee-times'
import { useTimesheetEmployees } from '@/db/hooks/use-timesheet-employees'
import { createFileRoute } from '@tanstack/react-router'
import {
  CellContext,
  createColumnHelper,
  getCoreRowModel,
  RowData,
  useReactTable,
  TableMeta,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import z from 'zod'

// --- Global Type Extensions (Required for Editable Columns) ---
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowId: string, columnId: string, value: unknown) => void
  }
}

// --- Interfaces for Data (Defined once for file scope) ---
interface PivotedRow extends Record<string, any> {
  timesheet_employee_id: string
  employee_id: string
  employee_first_name: string | undefined
  employee_last_name: string | undefined
  employee_cto: boolean | undefined
  // 🌟 ENHANCEMENT: Map to store the DB ID of the timesheet_employee_times record
  db_ids: Record<string, string | null>
}
interface Employee {
  id: string
  first_name: string
  last_name: string
  is_default_cto: boolean
}
interface TimeType {
  id: string
  type_name: string
  type_short_name: string
  is_paid: boolean
}
// Assuming TimesheetEmployeeTimes details look like this (with a DB ID)
interface TimesheetEmployeeTimeDetail {
  id: string // The DB record ID
  timesheet_employee_id: string
  time_type_id: string
  hours_amount: number
}

// --- Utility Functions ---

const arrayToMap = (arr: PivotedRow[]) =>
  arr.reduce(
    (acc, row) => ({ ...acc, [row.timesheet_employee_id]: row }),
    {} as Record<string, PivotedRow>,
  )

const ParamsSchema = z.object({
  year: z.coerce.number(),
  pp: z.coerce.number(),
  date: z.iso.date(),
})

// --- Tanstack Router Setup ---
export const Route = createFileRoute('/timesheets/pay-periods/$year/$pp/$date')(
  {
    params: {
      parse: (raw) => ParamsSchema.parse(raw),
    },
    component: RouteComponent,
  },
)

// --- CUSTOM EDITABLE CELL COMPONENT ---
const EditableHoursCell = <TData extends RowData>({
  getValue,
  row: { original: rowOriginal },
  column: { id: columnId },
  table,
}: CellContext<TData, unknown>) => {
  const rowId = (rowOriginal as PivotedRow).timesheet_employee_id
  const initialValue = getValue() as number

  const [value, setValue] = useState<number | string>(initialValue || 0)

  useEffect(() => {
    setValue(initialValue || 0)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(rowId, columnId, value)
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      step="0.25"
      min="0"
    />
  )
}

// --- Main Component ---
function RouteComponent() {
  const { date: dateString } = Route.useParams()
  const collection = timesheet_employee_times({ date: dateString })
  const date = useMemo(() => new Date(dateString), [dateString])

  // 1. Fetch normalized data from Tanstack cache
  const { data: timesheet_employees = [] } = useTimesheetEmployees(date)
  const { data: time_types = [] } = useTimeTypes()
  // Assuming this now fetches records including the record 'id'
  const { data: timesheet_employee_times_by_date = [] } =
    useTimesheetEmployeeTimes(dateString) as {
      data: TimesheetEmployeeTimeDetail[]
    }
  const { data: employees = [] } = useEmployees()

  // 2. Client-Side Pivot Logic
  const {
    rows: initialPivotedRows,
    columns: timeTypeColumns,
    // 🌟 NEW: Map to go from Column Name back to the original time_type_id
    timeTypeReverseMap,
  } = useMemo(() => {
    // --- Data Prep ---
    const timeTypeColumnMap: Record<string, string> = {}
    const timeTypeReverseMap: Record<string, string> = {} // ColumnName -> time_type_id

    time_types.forEach((type: TimeType) => {
      const cleanName = type.type_name.replace(/\s/g, '')
      timeTypeColumnMap[type.id] = cleanName
      timeTypeReverseMap[cleanName] = type.id
    })

    const initialColumnValues: Record<string, number> = Object.values(
      timeTypeColumnMap,
    ).reduce((cols, name) => ({ ...cols, [name]: 0 }), {})
    const employeesMap: Record<string, Employee> = employees.reduce(
      (acc, emp) => ({ ...acc, [emp.id]: emp }),
      {} as Record<string, Employee>,
    )

    // --- Initialize Grid Rows ---
    const gridMap: Record<string, PivotedRow> = timesheet_employees.reduce(
      (acc: Record<string, PivotedRow>, empRow: any) => {
        const employeeData = employeesMap[empRow.employee_id]
        acc[empRow.id] = {
          timesheet_employee_id: empRow.id,
          employee_id: empRow.employee_id,
          employee_first_name: employeeData?.first_name,
          employee_last_name: employeeData?.last_name,
          employee_cto: employeeData?.is_default_cto,
          ...initialColumnValues,
          db_ids: {}, // Initialize db_ids map
        }
        return acc
      },
      {} as Record<string, PivotedRow>,
    )

    // --- Pivot Times Data (Capture DB IDs) ---
    timesheet_employee_times_by_date.forEach((detail) => {
      const targetRow = gridMap[detail.timesheet_employee_id]

      if (targetRow) {
        const columnName = timeTypeColumnMap[detail.time_type_id]

        if (columnName) {
          targetRow[columnName] = detail.hours_amount
          // 🌟 ENHANCEMENT: Store the database record ID
          targetRow.db_ids[columnName] = detail.id
        }
      }
    })

    // --- Finalize Columns ---
    const finalTimeTypeColumns = time_types.map((type: TimeType) => ({
      dataKey: type.type_name.replace(/\s/g, ''),
      header: type.type_short_name,
      fullName: type.type_name,
      isPaid: type.is_paid,
    }))

    return {
      rows: Object.values(gridMap),
      columns: finalTimeTypeColumns,
      timeTypeReverseMap: timeTypeReverseMap, // Return the reverse map
    }
  }, [
    timesheet_employees,
    time_types,
    timesheet_employee_times_by_date,
    employees,
  ])

  // 3. State Management (Map for efficient updates)
  const [gridStateMap, setGridStateMap] = useState<Record<string, PivotedRow>>(
    () => arrayToMap(initialPivotedRows),
  )

  // Reset state map when source data changes
  useEffect(() => {
    setGridStateMap(arrayToMap(initialPivotedRows))
  }, [initialPivotedRows])

  // 4. Update Data Function (for Tanstack Table meta)
  const updateData = useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      const newHours = Number(value) || 0
      const currentRow = gridStateMap[rowId] // Get the currently stored row data

      if (!currentRow) return

      // 1. Get the DB ID and Type ID
      const oldRecordId = currentRow.db_ids[columnId] // The existing timesheet_employee_time_id (UUID or null)
      const timeTypeId = timeTypeReverseMap[columnId] // The original time_type_id (UUID)

      // --- Apply Local State Update Immediately (UX) ---
      setGridStateMap((old) => {
        return {
          ...old,
          [rowId]: {
            ...old[rowId],
            [columnId]: newHours,
          },
        }
      })

      // --- Determine Mutation (Insert vs. Update) ---

      // If hours are 0, we can skip the mutation unless an existing record needs to be zeroed/deleted
      if (newHours <= 0 && !oldRecordId) {
        return // Nothing to save or delete
      }

      // If hours are > 0 and a record already exists, UPDATE it.
      if (oldRecordId) {
        collection.update(oldRecordId, (draft) => {
          draft.hours_amount = newHours
        })
      }
      // If hours are > 0 and NO record exists, INSERT a new one.
      else if (timeTypeId) {
        collection.insert({
          id: crypto.randomUUID(),
          timesheet_employee_id: rowId,
          time_type_id: timeTypeId,
          hours_amount: newHours,
        })
      }
    },
    [gridStateMap, timeTypeReverseMap],
  )

  // Convert Map to Array for Tanstack Table consumption
  const tableData = useMemo(() => Object.values(gridStateMap), [gridStateMap])

  // 5. Tanstack Table Column Definition
  const columnHelper = useMemo(() => createColumnHelper<PivotedRow>(), [])

  const employeeColumns = useMemo(
    () => [
      columnHelper.accessor('employee_first_name', {
        header: 'First Name',
        cell: (info) => info.getValue() || '—',
      }),
      columnHelper.accessor('employee_last_name', {
        header: 'Last Name',
        cell: (info) => info.getValue() || '—',
      }),
    ],
    [columnHelper],
  )

  const hourColumns = useMemo(() => {
    return timeTypeColumns.map((colDef) =>
      columnHelper.accessor(colDef.dataKey as string, {
        header: () => <span title={colDef.fullName}>{colDef.header}</span>,
        footer: (props) => {
          return props.table
            .getRowModel()
            .rows.reduce(
              (sum, row) => sum + (Number(row.original[colDef.dataKey]) || 0),
              0,
            )
            .toFixed(2)
        },
        id: colDef.dataKey,
        cell: EditableHoursCell as any,
      }),
    )
  }, [columnHelper, timeTypeColumns])

  const columns = useMemo(
    () => [...employeeColumns, ...hourColumns],
    [employeeColumns, hourColumns],
  )

  // 6. Create Table Instance
  const table = useReactTable<PivotedRow>({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: updateData as TableMeta<PivotedRow>['updateData'],
    },
  })

  // 7. Final Render Call
  return RenderTable<PivotedRow>(table)
}
