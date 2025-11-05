import { RenderTable } from '@/components/render-table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { usePayrollYears } from '@/db/hooks/use-payroll-years'
import { formatDate } from '@/lib/date-fns'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { BookOpen } from 'lucide-react'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export const Route = createFileRoute('/timesheets/pay-periods/')({
  component: () => (
    <ErrorBoundary fallback={<div>Error loading route.</div>}>
      <Suspense fallback={<Spinner />}>
        <RouteComponent />
      </Suspense>
    </ErrorBoundary>
  ),
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
        header: () => <Label className="text-center">Start Date</Label>,
        cell: (info) =>
          formatDate(info.getValue(), {
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        enableSorting: false,
      }),
      columnHelper.accessor('end_date', {
        cell: (info) =>
          formatDate(info.getValue(), {
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>End Date</Label>,
        enableSorting: false,
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
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>First Pay Date</Label>,
        enableSorting: false,
      }),
      columnHelper.accessor('last_pay_date', {
        cell: (info) =>
          formatDate(info.getValue(), {
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          }),
        header: () => <Label>Last Pay Date</Label>,
        enableSorting: false,
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
  const { data: payroll_years } = usePayrollYears()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'year', desc: true },
  ])

  const payrollTable = useReactTable({
    columns,
    data: payroll_years,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  return RenderTable<PayrollYear>(payrollTable)
}
