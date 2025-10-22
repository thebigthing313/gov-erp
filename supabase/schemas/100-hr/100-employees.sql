create table public.employees (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    first_name text not null,
    middle_name text,
    last_name text not null,
    ssn_hash text not null,
    birth_date date not null,
    home_address text not null,
    mailing_address text,
    email_address text,
    home_phone text,
    cell_phone text,
    photo_url text,
    csc_id text,
    pers_membership_number text,
    pers_tier text,
    user_id uuid references auth.users(id),
    is_default_cto boolean not null default false,
    constraint first_name_length check (length(first_name) >= 2),
    constraint last_name_length check (length(last_name) >= 2),
    constraint birth_date_past check (birth_date < now())
);

create trigger updated_employees
    before update
    on public.employees
    for each row
    execute function public.set_audit_fields();