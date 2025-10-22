create table public.timesheet_employees(
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    timesheet_id uuid not null references public.timesheets(id),
    employee_id uuid not null references public.employees(id),
    is_late boolean not null default false,
    notes text,
    constraint unique_timesheet_employee unique (timesheet_id, employee_id)
);

create trigger updated_timesheet_employees
    before update or insert
    on public.timesheet_employees
    for each row
    execute function public.set_audit_fields();