create table "public"."pay_periods" (
    id uuid not null primary key default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    payroll_year smallint not null,
    pay_period_number smallint not null,
    begin_date date not null,
    end_date date not null,
    pay_date date not null,
    constraint unique_pay_period unique (payroll_year, pay_period_number),
    constraint valid_dates check (begin_date < end_date),
    constraint valid_pay_date check (pay_date >=end_date)
);

create trigger updated_pay_periods
    before update
    on public.pay_periods
    for each row
    execute function public.set_audit_fields();