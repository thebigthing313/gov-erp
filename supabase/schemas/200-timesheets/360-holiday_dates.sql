create table public.holiday_dates (
    id uuid not null primary key default gen_random_uuid(),
    holiday_id uuid not null references public.holidays(id) on delete cascade,
    holiday_date date not null,
    created_at timestamptz not null default now()
);