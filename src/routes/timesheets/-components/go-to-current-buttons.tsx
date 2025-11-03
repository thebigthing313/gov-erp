import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { useCurrentTimesheetInfo } from '@/db/hooks/use-current-timesheet-info'
import { Link } from '@tanstack/react-router'

export function GoToCurrentButtons() {
  const { current_pay_period, current_payroll_year, current_timesheet } =
    useCurrentTimesheetInfo()
  const isYearAvailable = current_payroll_year !== undefined
  const isPayPeriodAvailable = current_pay_period !== undefined
  const isTimesheetAvailable = current_timesheet !== undefined

  return (
    <ButtonGroup className="transition-all duration-300 hover:drop-shadow-primary hover:drop-shadow-sm">
      <ButtonGroupText>Go to Current:</ButtonGroupText>
      <Button disabled={!isYearAvailable} variant="outline" asChild>
        {current_payroll_year ? (
          <Link
            to="/timesheets/pay-periods/$year"
            params={{ year: current_payroll_year }}
          >
            Year{current_payroll_year && `: ${current_payroll_year}`}
          </Link>
        ) : (
          'Year'
        )}
      </Button>
      <Button disabled={!isPayPeriodAvailable} variant="outline" asChild>
        {current_pay_period && current_payroll_year ? (
          <Link
            to="/timesheets/pay-periods/$year/$pp"
            params={{
              year: current_payroll_year,
              pp: current_pay_period,
            }}
          >
            Pay Period{current_pay_period && `: ${current_pay_period}`}
          </Link>
        ) : (
          'Pay Period'
        )}
      </Button>
      <Button disabled={!isTimesheetAvailable} variant="outline" asChild>
        {current_timesheet && current_pay_period && current_payroll_year ? (
          <Link
            to="/timesheets/pay-periods/$year/$pp/$date"
            params={{
              year: current_payroll_year,
              pp: current_pay_period,
              date: current_timesheet,
            }}
          >
            Timesheet{current_timesheet && `: ${current_timesheet}`}
          </Link>
        ) : (
          'Timesheet'
        )}
      </Button>
    </ButtonGroup>
  )
}
