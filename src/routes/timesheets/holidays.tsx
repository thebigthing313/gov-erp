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
import { formatDate } from '@/lib/date-fns'
import { createFileRoute } from '@tanstack/react-router'
import { PrinterIcon, WandSparkles } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'
import { WizardDialog } from './-components/wizard-dialog'
import { useForm } from '@tanstack/react-form'
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { ComboBox } from '@/components/form-fields/combo-box'
import { FormField } from '@/components/form-fields/form-field'
import { DateInput } from '@/components/form-fields/date-input'

export const Route = createFileRoute('/timesheets/holidays')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
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
          <PrintButton />
        </ButtonGroup>
      </nav>
      <AddNewHolidayForm
        className="rounded-md border p-2 bg-accent max-w-lg"
        year={currentYear}
      />
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
              key={holiday.holiday_id}
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
    </div>
  )
}

interface AddNewHolidayFormProps {
  year: number
  className?: string
}

function AddNewHolidayForm({ year, className }: AddNewHolidayFormProps) {
  const { holidaysAlphabetical, holidayDatesByYear, holiday_dates } =
    useHolidays(year)
  const holidays = holidayDatesByYear.data

  const comboboxItems = holidaysAlphabetical.data.map((holiday) => ({
    label: holiday.name, // Display name (e.g., "Christmas Day")
    value: holiday.id, // Unique ID (e.g., "christmas")
  }))

  const form = useForm({
    defaultValues: {
      holiday_id: '',
      holiday_date: undefined as Date | undefined,
    },
    onSubmit: async ({ value }) => {
      //check if holiday and holiday_date already exist
      const existingHoliday = holidays.find(
        (date) =>
          date.holiday_id === value.holiday_id &&
          date.holiday_date === value.holiday_date,
      )
      //if so, notify user
      if (existingHoliday) {
        toast.warning('Holiday date is already in the schedule')
      } else {
        //if not, insert holiday_date
        holiday_dates.insert({
          id: crypto.randomUUID().toString(),
          holiday_id: value.holiday_id,
          holiday_date: value.holiday_date!,
        } as any)
        // reset form
        form.reset()
      }
    },
  })
  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <FieldSet className="gap-2">
          <FieldLegend>New Holiday</FieldLegend>
          <FieldDescription>
            Add a new holiday to the schedule.
          </FieldDescription>
          <FieldSeparator />
          <FieldGroup>
            <form.Field
              name="holiday_id"
              children={(field) => {
                return (
                  <FormField
                    label="Holiday"
                    htmlFor={field.name}
                    errors={field.state.meta.errors}
                  >
                    <ComboBox
                      value={field.state.value}
                      onChange={(newValue) => field.handleChange(newValue)}
                      items={comboboxItems}
                    />
                  </FormField>
                )
              }}
            />
            <form.Field
              name="holiday_date"
              children={(field) => {
                return (
                  <FormField
                    label="Holiday Date"
                    htmlFor={field.name}
                    errors={field.state.meta.errors}
                  >
                    <DateInput
                      value={field.state.value}
                      onChange={(newValue) => field.handleChange(newValue)}
                    />
                  </FormField>
                )
              }}
            />
          </FieldGroup>
        </FieldSet>
      </form>
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

function PrintButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="outline" size="icon">
          <PrinterIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Print</TooltipContent>
    </Tooltip>
  )
}
