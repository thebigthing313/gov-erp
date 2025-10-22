create table public.starting_balances (
    id uuid not null default gen_random_uuid() primary key,
    payroll_year smallint not null ,
    employee_id uuid not null references public.employees(id) on delete cascade,
    time_type_id uuid not null references public.time_types(id) on delete cascade,
    starting_balance numeric(8,2) not null default 0,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    constraint unique_starting_balance unique (payroll_year, employee_id, time_type_id),
    constraint starting_balance_not_negative check (starting_balance >= 0)
);

create trigger update_starting_balances
    before update or insert
    on public.starting_balances
    for each row
    execute function public.set_audit_fields()