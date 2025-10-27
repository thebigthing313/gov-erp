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
import { useHolidays } from '@/db/hooks/use-holidays'

import { createFileRoute } from '@tanstack/react-router'
import { Plus, PrinterIcon, WandSparkles } from 'lucide-react'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
import { forwardRef } from 'react'
import { WizardDialog } from './-components/wizard-dialog'
import { formatDate } from '@/lib/date-fns'
import { AddNewHolidayForm } from './-components/new-holiday-form'
import { PrintLayout } from '@/components/layout/print/print-layout'
import { useReactToPrint } from 'react-to-print'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const { holidayDatesByYear } = useHolidays(currentYear)

  const holidays = holidayDatesByYear.data

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
        {holidays.map((holiday, index) => {
          const formattedDate = formatDate(holiday.holiday_date, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long',
          })
          return (
            <HolidayCard
              index={index + 1}
              key={holiday.id}
              title={holiday.name}
              description={formattedDate}
              className="min-w-xs not-odd:bg-muted/50"
            />
          )
        })}
      </div>
      <WizardDialog
        year={currentYear}
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
      />
      <AddNewHolidayForm
        year={currentYear}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
      <div className="hidden">
        <PrintableHolidaySchedule ref={contentRef} year={currentYear} />
      </div>
    </div>
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
    const { holidayDatesByYear } = useHolidays(year)
    const holidays = holidayDatesByYear.data

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
            {holidays.map((holiday) => (
              <div key={holiday.id} className="grid grid-cols-2">
                <div className="font-semibold">{holiday.name}</div>
                <div>
                  {formatDate(holiday.holiday_date, {
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
