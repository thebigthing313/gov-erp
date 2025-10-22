create table public.timesheet_employee_times (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    timesheet_employee_id uuid not null references public.timesheet_employees(id),
    time_type_id uuid not null references public.time_types(id),
    hours_amount float8 not null default 0,
    constraint unique_timesheet_employee_time unique (timesheet_employee_id, time_type_id)
);

create trigger updated_timesheet_employee_times
    before update or insert
    on public.timesheet_employee_times
    for each row
    execute function public.set_audit_fields();