create table public.time_types (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    created_by uuid references auth.users(id) on delete set null,
    modified_at timestamp with time zone not null default now(),
    modified_by uuid references auth.users(id) on delete set null,
    type_name text not null,
    type_short_name text not null,
    is_paid boolean not null,
    constraint unique_type unique(type_name)
);

create trigger updated_time_types
    before update
    on public.time_types
    for each row
    execute function public.set_audit_fields();