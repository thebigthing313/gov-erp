create table public.timesheet_employees(
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    modified_at timestamp with time zone not null default now(),
    timesheet_id uuid not null references public.timesheets(id),
    employee_id uuid not null references public.employees(id),
    is_late boolean not null default false,
    notes text,
    constraint unique_timesheet_employee unique (timesheet_id, employee_id)
);