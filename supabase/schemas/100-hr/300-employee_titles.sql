create type public.title_status as enum (
    'permanent', 'part-time', 'seasonal', 'provisional', 'volunteer'
);

create table public.employee_titles (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    modified_at timestamp with time zone not null default now(),
    employee_id uuid not null references public.employees(id) on delete cascade,
    title_id uuid not null references public.titles(id) on delete cascade,
    title_status public.title_status not null,
    start_date date not null,
    end_date date,
    constraint valid_end_date check (end_date >= start_date)
);