create type public.title_status as enum (
    'permanent', 'part-time', 'seasonal', 'provisional', 'volunteer'
);

create table public.employee_titles (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    employee_id uuid not null references public.employees(id) on delete cascade,
    title_id uuid not null references public.titles(id) on delete cascade,
    title_status public.title_status not null,
    start_date date not null,
    end_date date,
    constraint valid_end_date check (end_date >= start_date)
);

create trigger updated_employees_titles
    before update
    on public.employee_titles
    for each row
    execute function public.set_audit_fields();