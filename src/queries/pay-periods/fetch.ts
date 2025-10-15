import { supabase } from "@/main";
import { Row } from "@/lib/data-types";
import { Prettify } from "@/lib/utils";

type PayPeriod = Row<"pay_periods">;
type Timesheet = Row<"timesheets">;
type TimesheetEmployee = Row<"timesheet_employees">;
type TimesheetEmployeeTime = Row<"timesheet_employee_times">;
type TimeType = Row<"time_types">;

type EmployeePayPeriodRecord = Prettify<
  PayPeriod & {
    timesheets: Prettify<
      Timesheet & {
        timesheet_employees: Prettify<
          TimesheetEmployee & {
            timesheet_employee_times: Prettify<
              TimesheetEmployeeTime & {
                time_types: TimeType;
              }
            >[];
          }
        >[];
      }
    >[];
  }
>;

export async function fetchPayPeriodsByYear(
  payrollYear: number,
): Promise<PayPeriod[]> {
  const { data, error } = await supabase
    .from("pay_periods")
    .select("*")
    .eq("payroll_year", payrollYear)
    .order("pay_period_number", { ascending: true });

  if (error) throw error;

  return data;
}

export async function fetchPayPeriodById(
  id: string,
): Promise<PayPeriod> {
  const { data, error } = await supabase
    .from("pay_periods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function fetchPayPeriodByYearAndEmployee(
  payrollYear: number,
  employeeId: string,
): Promise<EmployeePayPeriodRecord[] | null> {
  const { data, error } = await supabase
    .from("pay_periods")
    .select(
      "*,timesheets(*,timesheet_employees(*,timesheet_employee_times(*,time_types(*))))",
    )
    .eq("payroll_year", payrollYear)
    .eq("timesheets.timesheet_employees.employee_id", employeeId)
    .order("pay_period_number", { ascending: true });

  if (error) throw error;

  return data as EmployeePayPeriodRecord[];
}
