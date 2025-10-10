create table public.time_types (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    type_name text not null,
    type_short_name text not null,
    is_paid boolean not null,
    constraint unique_type unique(type_name)
);

