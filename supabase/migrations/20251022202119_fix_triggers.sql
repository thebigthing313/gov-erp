drop trigger if exists "updated_employees_titles" on "public"."employee_titles";

drop trigger if exists "updated_employees" on "public"."employees";

drop trigger if exists "updated_holiday_dates" on "public"."holiday_dates";

drop trigger if exists "updated_holidays" on "public"."holidays";

drop trigger if exists "updated_pay_periods" on "public"."pay_periods";

drop trigger if exists "update_starting_balances" on "public"."starting_balances";

drop trigger if exists "updated_time_types" on "public"."time_types";

drop trigger if exists "updated_timesheet_employee_times" on "public"."timesheet_employee_times";

drop trigger if exists "updated_timesheet_employees" on "public"."timesheet_employees";

drop trigger if exists "updated_timesheets" on "public"."timesheets";

drop trigger if exists "updated_titles" on "public"."titles";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_audit_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
    user_id uuid;
begin

    user_id := auth.uid();

    if TG_OP = 'INSERT' then
        if user_id is not null then
            new.created_by = user_id;
        end if;
    end if;

    if TG_OP = 'UPDATE' OR TG_OP = 'INSERT' then
        new.modified_at = now();
        if user_id is not null then
            new.modified_by = user_id;
        end if;
    end if;

    return new;
end;
$function$
;

CREATE TRIGGER updated_employees_titles BEFORE INSERT OR UPDATE ON public.employee_titles FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_employees BEFORE INSERT OR UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_holiday_dates BEFORE INSERT OR UPDATE ON public.holiday_dates FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_holidays BEFORE INSERT OR UPDATE ON public.holidays FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_pay_periods BEFORE INSERT OR UPDATE ON public.pay_periods FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER update_starting_balances BEFORE INSERT OR UPDATE ON public.starting_balances FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_time_types BEFORE INSERT OR UPDATE ON public.time_types FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_timesheet_employee_times BEFORE INSERT OR UPDATE ON public.timesheet_employee_times FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_timesheet_employees BEFORE INSERT OR UPDATE ON public.timesheet_employees FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_timesheets BEFORE INSERT OR UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_titles BEFORE INSERT OR UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION set_audit_fields();


