create table public.holiday_dates (
    id uuid not null primary key default gen_random_uuid(),
    holiday_id uuid not null references public.holidays(id) on delete cascade,
    holiday_date date not null,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null
);

create trigger updated_holiday_dates
    before update
    on public.holiday_dates
    for each row
    execute function public.set_audit_fields();