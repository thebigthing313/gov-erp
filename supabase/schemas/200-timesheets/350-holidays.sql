create table public.holidays (
    id uuid not null primary key default gen_random_uuid(),
    name text not null,
    definition text not null,
    is_function_available boolean not null default false,
    is_active boolean not null default true,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null
);

create trigger updated_holidays
    before update or insert
    on public.holidays
    for each row
    execute function public.set_audit_fields();