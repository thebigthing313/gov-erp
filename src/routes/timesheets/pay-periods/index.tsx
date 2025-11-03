import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePayrollYears } from '@/db/hooks/use-payroll-years'
import { formatDate } from '@/lib/date-fns'
import { cn } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDown,
  BookOpen,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/timesheets/pay-periods/')({
  component: RouteComponent,
})

type PayrollYear = {
  end_date: Date
  year: number
  start_date: Date
  first_pay_date: Date
  last_pay_date: Date
  pay_period_count: number
}

const columnHelper = createColumnHelper<PayrollYear>()

const columns = [
  columnHelper.accessor('year', {
    cell: (info) => info.getValue(),
    header: () => <Label>Year</Label>,
    sortingFn: 'basic',
  }),
  columnHelper.accessor('pay_period_count', {
    cell: (info) => info.getValue(),
    header: () => <Label>Pay Periods</Label>,
    sortingFn: 'basic',
  }),
  columnHelper.group({
    id: 'timesheets',
    header: () => <Label className="text-center">Timesheets</Label>,
    columns: [
      columnHelper.accessor('start_date', {
        cell: (info) =>
          formatDate(info.getValue(), {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>Start Date</Label>,
        sortingFn: 'datetime',
      }),
      columnHelper.accessor('end_date', {
        cell: (info) =>
          formatDate(info.getValue(), {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>End Date</Label>,
        sortingFn: 'datetime',
      }),
    ],
  }),
  columnHelper.group({
    id: 'paychecks',
    header: () => <Label>Paychecks</Label>,
    columns: [
      columnHelper.accessor('first_pay_date', {
        cell: (info) =>
          formatDate(info.getValue(), {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>First Pay Date</Label>,
        sortingFn: 'datetime',
      }),
      columnHelper.accessor('last_pay_date', {
        cell: (info) =>
          formatDate(info.getValue(), {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>Last Pay Date</Label>,
        sortingFn: 'datetime',
      }),
    ],
  }),

  columnHelper.display({
    id: 'actions',
    cell: (props) => (
      <Button type="button" variant="ghost" size="icon" asChild>
        <Link
          to="/timesheets/pay-periods/$year"
          params={{ year: props.row.original.year }}
        >
          <BookOpen />
        </Link>
      </Button>
    ),
    header: () => <Label>Open</Label>,
  }),
]

function RouteComponent() {
  const { data: payroll_years, isLoading, isError } = usePayrollYears()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'year', desc: true },
  ])

  const table = useReactTable({
    columns,
    data: payroll_years,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })
  if (isLoading) {
    return <div>Loading payroll years...</div>
  }
  if (isError) {
    return <div>Error loading payroll years.</div>
  }

  return (
    <div className="w-full border rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'w-full flex gap-2',
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                                ? 'Sort descending'
                                : 'Clear sort'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() &&
                          (header.column.getIsSorted() === 'asc' ? (
                            <ChevronUpIcon className="ml-2 h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                          ))}
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
