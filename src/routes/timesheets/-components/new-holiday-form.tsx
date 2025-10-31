import { ComboBox } from '@/components/form-fields/combo-box'
import { DateInput } from '@/components/form-fields/date-input'
import { FormField } from '@/components/form-fields/form-field'
import { SubmitButton } from '@/components/form-fields/submit-button'
import { FieldGroup, FieldSeparator, FieldSet } from '@/components/ui/field'
import { useHolidayDates } from '@/db/hooks/use-holiday-dates'
import { areDatesEqual } from '@/lib/date-fns'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { getHolidayDate } from '../-lib/holiday-wizard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import z from 'zod'
import { useHolidays } from '@/db/hooks/use-holidays'
import { holiday_dates } from '@/db/collections/holiday-dates'

interface AddNewHolidayFormProps {
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddNewHolidayForm({
  year,
  open,
  onOpenChange,
}: AddNewHolidayFormProps) {
  const {
    data: holidays,
    isLoading: isLoadingHolidays,
    isError: isErrorHolidays,
  } = useHolidays()
  const {
    data: holiday_dates_by_year,
    isLoading: isLoadingHolidayDates,
    isError: isErrorHolidayDates,
  } = useHolidayDates(year)

  const comboboxItems = holidays.map((holiday) => ({
    label: holiday.name,
    value: holiday.id,
  }))

  const AddHolidaySchema = z.object({
    holiday_id: z.uuid('Holiday selection is required.'),
    holiday_date: z.date(),
  })

  const defaultValues: z.infer<typeof AddHolidaySchema> = {
    holiday_id: '',
    holiday_date: new Date(Date.UTC(year, 0, 1)),
  }

  const form = useForm({
    validators: {
      onChange: AddHolidaySchema,
    },
    defaultValues: defaultValues,
    onSubmit: ({ value }) => {
      const formDate = value.holiday_date
      if (!formDate) {
        toast.error('Please select a holiday date')
        return
      }

      const existingHoliday = holiday_dates_by_year.find((holiday_date) => {
        return (
          holiday_date.holiday_id === value.holiday_id &&
          areDatesEqual(holiday_date.holiday_date, formDate)
        )
      })

      //if so, notify user
      if (existingHoliday) {
        toast.warning('Holiday date is already in the schedule')
      } else {
        // if not, insert holiday_date
        holiday_dates.insert({
          id: crypto.randomUUID().toString(),
          holiday_id: value.holiday_id,
          holiday_date: value.holiday_date!,
        } as any)
        onOpenChange(false)
      }
    },
  })

  if (isLoadingHolidays || isLoadingHolidayDates) {
    return <div>Loading...</div>
  }
  if (
    isErrorHolidays ||
    isErrorHolidayDates ||
    !holidays ||
    !holiday_dates_by_year
  ) {
    return <div>Error loading data.</div>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Holiday</DialogTitle>
          <DialogDescription>
            The form will generate a default date that you can change if needed.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldSet>
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
                        onChange={(newValue) => {
                          field.handleChange(newValue)
                          const calculatedHoliday = getHolidayDate(
                            year,
                            newValue,
                          )
                          if (calculatedHoliday)
                            form.setFieldValue(
                              'holiday_date',
                              calculatedHoliday,
                            )
                        }}
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
                        startDate={new Date(year, 0, 1)}
                        endDate={new Date(year, 11, 31)}
                        layout="dropdown-months"
                        value={field.state.value}
                        onChange={(newValue) => {
                          newValue && field.handleChange(newValue)
                        }}
                      />
                    </FormField>
                  )
                }}
              />
            </FieldGroup>
          </FieldSet>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <SubmitButton
                disabled={!canSubmit || isSubmitting}
                isLoading={isSubmitting}
              >
                Submit
              </SubmitButton>
            )}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
