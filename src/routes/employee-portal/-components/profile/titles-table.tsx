import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'

import { Check } from 'lucide-react'

export type Title = {
  titleName: string
  titleCode: string
  startDate: string
  endDate: string | null
  status: string
  cscDescriptionUrl: string | undefined
  isClerical: boolean
  isSalaried: boolean
}

const columnHelper = createColumnHelper<Title>()

const columns = [
  columnHelper.accessor((row) => row.titleName, {
    id: 'title_name',
    cell: (info) => info.getValue(),
    header: 'Title',
  }),
  columnHelper.accessor((row) => row.titleCode, {
    id: 'title_code',
    cell: (info) => {
      return (
        <Button variant="link">
          <a
            href={info.row.original.cscDescriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {info.getValue()}
          </a>
        </Button>
      )
    },
    header: 'CSC Code',
  }),
  columnHelper.accessor((row) => row.startDate, {
    id: 'start_date',
    cell: (info) => info.getValue(),
    header: 'Start Date',
  }),
  columnHelper.accessor((row) => row.endDate, {
    id: 'end_date',
    cell: (info) => {
      return info.getValue() || 'Current'
    },
    header: 'End Date',
  }),
  columnHelper.accessor((row) => row.status, {
    id: 'status',
    cell: (info) => info.getValue(),
    header: 'Status',
  }),
  columnHelper.accessor((row) => row.isClerical, {
    id: 'is_clerical',
    cell: (info) => {
      const isClerical = info.getValue()
      return isClerical ? <CenteredCheck /> : null
    },
    header: () => <span className="flex w-full justify-center">Clerical</span>,
  }),
  columnHelper.accessor((row) => row.isSalaried, {
    id: 'is_salaried',
    cell: (info) => {
      const isSalaried = info.getValue()
      return isSalaried ? <CenteredCheck /> : null
    },
    header: () => <span className="flex w-full justify-center">Salaried</span>,
  }),
]

type TitlesTableProps = {
  data: Title[]
}

export function TitlesTable({ data }: TitlesTableProps) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  const headerGroups = table.getHeaderGroups()

  return (
    <Table>
      <TableHeader>
        {headerGroups.map((headerGroup) => {
          return (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} aria-colspan={header.colSpan}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          )
        })}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          return (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function CenteredCheck() {
  return (
    <div className="w-full flex justify-center">
      <Check />
    </div>
  )
}
