import { usePayPeriods } from '@/db/hooks/use-pay-periods'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/date-fns'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Spinner } from '@/components/ui/spinner'
import { useLiveSuspenseQuery } from '@tanstack/react-db'
import { RenderTable } from '@/components/render-table'

const RouteParam = z.object({
  year: z.coerce.number(),
})

export const Route = createFileRoute('/timesheets/pay-periods/$year/')({
  component: () => (
    <ErrorBoundary fallback={<div>Error loading route.</div>}>
      <Suspense fallback={<Spinner />}>
        <RouteComponent />
      </Suspense>
    </ErrorBoundary>
  ),
  params: {
    parse: (raw) => RouteParam.parse(raw),
  },
  loader: ({ params }) => {
    return { crumb: `${params.year}` }
  },
})

type PayPeriod = {
  pp_number: number
  start_date: Date
  end_date: Date
  pay_date: Date
}

const columnHelper = createColumnHelper<PayPeriod>()

const columns = [
  columnHelper.accessor('pp_number', {
    header: () => <Label>Pay Period #</Label>,
    cell: (info) => info.getValue(),
    sortingFn: 'basic',
  }),
  columnHelper.accessor('start_date', {
    header: () => <Label>Start Date</Label>,
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
    header: () => <Label>End Date</Label>,
    cell: (info) =>
      formatDate(info.getValue(), {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }),
    enableSorting: false,
  }),
  columnHelper.accessor('pay_date', {
    header: () => <Label>Pay Date</Label>,
    cell: (info) =>
      formatDate(info.getValue(), {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }),
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => <div>actions</div>,
    header: () => <Label>Actions</Label>,
  }),
]

function RouteComponent() {
  const { year } = Route.useParams()
  const { collection } = usePayPeriods(year)

  const { data: pay_periods_by_year } = useLiveSuspenseQuery((q) =>
    q.from({ pay_period: collection }).select(({ pay_period }) => {
      return {
        pp_number: pay_period.pay_period_number,
        start_date: pay_period.begin_date,
        end_date: pay_period.end_date,
        pay_date: pay_period.pay_date,
      }
    }),
  )

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'pp_number', desc: false },
  ])

  const pptable = useReactTable({
    columns,
    data: pay_periods_by_year,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  })

  return RenderTable<PayPeriod>(pptable)
}
