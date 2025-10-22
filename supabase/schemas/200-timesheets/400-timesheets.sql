create or replace function public.verify_timesheet_date(
    p_timesheet_date date,
    p_pay_period_id uuid
    )
    returns boolean
    language sql
    security invoker
    set search_path = ''
    as $$
        select exists (
            select 1 
            from public.pay_periods pp
            where pp.id = p_pay_period_id
            and p_timesheet_date between pp.begin_date and pp.end_date
        );
    $$;

create table public.timesheets (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    pay_period_id uuid not null references public.pay_periods(id),
    timesheet_date date unique not null,
    holiday_date_id uuid references public.holiday_dates(id),
    notes text,
    check (public.verify_timesheet_date(timesheet_date, pay_period_id))
);

create trigger updated_timesheets
    before update
    on public.timesheets
    for each row
    execute function public.set_audit_fields();
