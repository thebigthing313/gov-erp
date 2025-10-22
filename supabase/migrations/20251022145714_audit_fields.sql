drop trigger if exists "updated_starting_balances" on "public"."starting_balances";

drop trigger if exists "updated_employees" on "public"."employees";

drop trigger if exists "updated_titles" on "public"."titles";

drop function if exists "public"."update_employees_modified_at"();

drop function if exists "public"."update_starting_balances_modified_at"();

drop function if exists "public"."update_titles_modified_at"();

alter table "public"."employee_titles" add column "created_by" uuid;

alter table "public"."employee_titles" add column "modified_by" uuid;

alter table "public"."employees" add column "created_by" uuid;

alter table "public"."employees" add column "modified_by" uuid;

alter table "public"."holiday_dates" add column "created_by" uuid;

alter table "public"."holiday_dates" add column "modified_at" timestamp with time zone not null default now();

alter table "public"."holiday_dates" add column "modified_by" uuid;

alter table "public"."holidays" add column "created_by" uuid;

alter table "public"."holidays" add column "is_function_available" boolean not null default false;

alter table "public"."holidays" add column "modified_at" timestamp with time zone not null default now();

alter table "public"."holidays" add column "modified_by" uuid;

alter table "public"."pay_periods" add column "created_by" uuid;

alter table "public"."pay_periods" add column "modified_by" uuid;

alter table "public"."starting_balances" add column "created_by" uuid;

alter table "public"."starting_balances" add column "modified_by" uuid;

alter table "public"."starting_balances" alter column "created_at" set not null;

alter table "public"."starting_balances" alter column "modified_at" set not null;

alter table "public"."time_types" add column "created_by" uuid;

alter table "public"."time_types" add column "modified_at" timestamp with time zone not null default now();

alter table "public"."time_types" add column "modified_by" uuid;

alter table "public"."timesheet_employee_times" add column "created_by" uuid;

alter table "public"."timesheet_employee_times" add column "modified_by" uuid;

alter table "public"."timesheet_employees" add column "created_by" uuid;

alter table "public"."timesheet_employees" add column "modified_by" uuid;

alter table "public"."timesheets" add column "created_by" uuid;

alter table "public"."timesheets" add column "modified_by" uuid;

alter table "public"."titles" add column "created_by" uuid;

alter table "public"."titles" add column "modified_by" uuid;

alter table "public"."employee_titles" add constraint "employee_titles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."employee_titles" validate constraint "employee_titles_created_by_fkey";

alter table "public"."employee_titles" add constraint "employee_titles_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."employee_titles" validate constraint "employee_titles_modified_by_fkey";

alter table "public"."employees" add constraint "employees_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."employees" validate constraint "employees_created_by_fkey";

alter table "public"."employees" add constraint "employees_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."employees" validate constraint "employees_modified_by_fkey";

alter table "public"."holiday_dates" add constraint "holiday_dates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."holiday_dates" validate constraint "holiday_dates_created_by_fkey";

alter table "public"."holiday_dates" add constraint "holiday_dates_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."holiday_dates" validate constraint "holiday_dates_modified_by_fkey";

alter table "public"."holidays" add constraint "holidays_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."holidays" validate constraint "holidays_created_by_fkey";

alter table "public"."holidays" add constraint "holidays_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."holidays" validate constraint "holidays_modified_by_fkey";

alter table "public"."pay_periods" add constraint "pay_periods_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."pay_periods" validate constraint "pay_periods_created_by_fkey";

alter table "public"."pay_periods" add constraint "pay_periods_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."pay_periods" validate constraint "pay_periods_modified_by_fkey";

alter table "public"."starting_balances" add constraint "starting_balances_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."starting_balances" validate constraint "starting_balances_created_by_fkey";

alter table "public"."starting_balances" add constraint "starting_balances_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."starting_balances" validate constraint "starting_balances_modified_by_fkey";

alter table "public"."time_types" add constraint "time_types_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."time_types" validate constraint "time_types_created_by_fkey";

alter table "public"."time_types" add constraint "time_types_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."time_types" validate constraint "time_types_modified_by_fkey";

alter table "public"."timesheet_employee_times" add constraint "timesheet_employee_times_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."timesheet_employee_times" validate constraint "timesheet_employee_times_created_by_fkey";

alter table "public"."timesheet_employee_times" add constraint "timesheet_employee_times_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."timesheet_employee_times" validate constraint "timesheet_employee_times_modified_by_fkey";

alter table "public"."timesheet_employees" add constraint "timesheet_employees_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."timesheet_employees" validate constraint "timesheet_employees_created_by_fkey";

alter table "public"."timesheet_employees" add constraint "timesheet_employees_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."timesheet_employees" validate constraint "timesheet_employees_modified_by_fkey";

alter table "public"."timesheets" add constraint "timesheets_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."timesheets" validate constraint "timesheets_created_by_fkey";

alter table "public"."timesheets" add constraint "timesheets_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."timesheets" validate constraint "timesheets_modified_by_fkey";

alter table "public"."titles" add constraint "titles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."titles" validate constraint "titles_created_by_fkey";

alter table "public"."titles" add constraint "titles_modified_by_fkey" FOREIGN KEY (modified_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."titles" validate constraint "titles_modified_by_fkey";

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

    if TG_OP = 'UPDATE' then
        new.modified_at = now();
        if user_id is not null then
            new.modified_by = user_id;
        end if;
    end if;

    return new;
end;
$function$
;

CREATE TRIGGER updated_employees_titles BEFORE UPDATE ON public.employee_titles FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_holiday_dates BEFORE UPDATE ON public.holiday_dates FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_holidays BEFORE UPDATE ON public.holidays FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_pay_periods BEFORE UPDATE ON public.pay_periods FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER update_starting_balances BEFORE UPDATE ON public.starting_balances FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_time_types BEFORE UPDATE ON public.time_types FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_timesheet_employee_times BEFORE UPDATE ON public.timesheet_employee_times FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_timesheet_employees BEFORE UPDATE ON public.timesheet_employees FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_timesheets BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_employees BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER updated_titles BEFORE UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION set_audit_fields();


