import { HolidayCard } from '@/components/cards/holiday-card'
import { Typography } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { YearSelector } from '@/components/year-selector'
import { useHolidayDates } from '@/db/hooks/use-holiday-dates'

import { createFileRoute } from '@tanstack/react-router'
import { Plus, PrinterIcon, WandSparkles } from 'lucide-react'
import {
  Dispatch,
  lazy,
  SetStateAction,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'
import { forwardRef } from 'react'
import { formatDate } from '@/lib/date-fns'
import { PrintLayout } from '@/components/layout/print/print-layout'
import { useReactToPrint } from 'react-to-print'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { holiday_dates } from '@/db/collections/holiday-dates'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const LazyWizardDialog = lazy(() => import('./-components/wizard-dialog'))
  const LazyAddForm = lazy(() => import('./-components/new-holiday-form'))
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isDeleteApproved, setIsDeleteApproved] = useState(false)
  const [holidayToDelete, setHolidayToDelete] = useState<string | null>(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Effect to handle deletion after confirmation
  useEffect(() => {
    if (isDeleteApproved && holidayToDelete) {
      holiday_dates.delete(holidayToDelete)
      setHolidayToDelete(null)
      setIsDeleteApproved(false)
    }
  }, [isDeleteApproved, holidayToDelete])
  const {
    data: holiday_dates_by_year,
    isLoading,
    isError,
  } = useHolidayDates(currentYear)
  if (isLoading) return <div>Loading...</div>
  if (isError || !holiday_dates_by_year)
    return <div>Error loading holidays.</div>

  function handleDelete(holiday_id: string) {
    setHolidayToDelete(holiday_id)
    setIsAlertOpen(true)
  }

  return (
    <div className="max-w-3xl flex flex-col gap-2">
      <Typography tag="h3">Paid Holiday Schedule</Typography>
      <nav className="flex flex-row items-center gap-4">
        <ButtonGroup className="" orientation="horizontal">
          <YearSelector
            value={currentYear}
            onChange={(year) => setCurrentYear(year)}
            className="w-48"
          />
          <HolidayWizardButton setIsWizardOpen={setIsWizardOpen} />
          <AddNewHolidayFormButton setIsFormOpen={setIsFormOpen} />
          <PrintButton onClick={reactToPrintFn} />
        </ButtonGroup>
      </nav>
      <div className="flex flex-row flex-wrap gap-0">
        {holiday_dates_by_year.map((holiday_date, index) => {
          const formattedDate = formatDate(holiday_date.holiday_date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
          })
          return (
            <HolidayCard
              holiday_id={holiday_date.id}
              index={index + 1}
              key={holiday_date.id}
              title={holiday_date.holiday.name}
              description={formattedDate}
              className="min-w-xs not-odd:bg-muted/50"
              onDelete={(id) => handleDelete(id)}
            />
          )
        })}
      </div>
      {isWizardOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyWizardDialog
            year={currentYear}
            open={isWizardOpen}
            onOpenChange={setIsWizardOpen}
          />
        </Suspense>
      )}

      {isFormOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyAddForm
            year={currentYear}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
          />
        </Suspense>
      )}
      <div className="hidden">
        <PrintableHolidaySchedule ref={contentRef} year={currentYear} />
      </div>
      <DeleteConfirmationDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onDialogCancel={() => {
          setHolidayToDelete(null)
          setIsAlertOpen(false)
        }}
        onDialogDelete={() => {
          setIsDeleteApproved(true)
          setIsAlertOpen(false)
        }}
      />
    </div>
  )
}

interface DeleteConfirmationDialogProps {
  onDialogCancel: () => void
  onDialogDelete: () => void
}

function DeleteConfirmationDialog({
  onDialogCancel,
  onDialogDelete,
  ...props
}: DeleteConfirmationDialogProps &
  React.ComponentPropsWithoutRef<typeof AlertDialog>) {
  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this holiday from the schedule? This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>{' '}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onDialogCancel()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onDialogDelete()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function HolidayWizardButton({
  setIsWizardOpen,
}: {
  setIsWizardOpen: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsWizardOpen(true)}
        >
          <WandSparkles />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Holiday Wizard</TooltipContent>
    </Tooltip>
  )
}

function AddNewHolidayFormButton({
  setIsFormOpen,
}: {
  setIsFormOpen: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add New Holiday</TooltipContent>
    </Tooltip>
  )
}

function PrintButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline" size="icon" onClick={onClick}>
          <PrinterIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Print</TooltipContent>
    </Tooltip>
  )
}

const PrintableHolidaySchedule = forwardRef<HTMLDivElement, { year: number }>(
  ({ year }, ref) => {
    const {
      data: holiday_dates_by_year,
      isLoading,
      isError,
    } = useHolidayDates(year)
    if (isLoading) return <div>Loading...</div>
    if (isError || !holiday_dates_by_year)
      return <div>Error loading holidays.</div>

    return (
      <PrintLayout ref={ref}>
        <div className="flex flex-col items-center">
          <div className="text-xl font-semibold mb-2">
            {year} Holiday Schedule
          </div>
          <div className="tracking-tighter">
            If a holiday falls on a Saturday, it will be observed on the
            preceding Monday.
          </div>
          <div className="tracking-tighter mb-2">
            If a holiday falls on a Sunday, it will be observed on the following
            Monday.
          </div>
          <div className="flex flex-col gap-1">
            {holiday_dates_by_year.map((holiday_date) => (
              <div key={holiday_date.id} className="grid grid-cols-2">
                <div className="font-semibold">{holiday_date.holiday.name}</div>
                <div>
                  {formatDate(holiday_date.holiday_date, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    weekday: 'long',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PrintLayout>
    )
  },
)
