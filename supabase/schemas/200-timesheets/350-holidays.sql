create table public.holidays (
    id uuid not null primary key default gen_random_uuid(),
    name text not null,
    definition text not null,
    created_at timestamptz not null default now()
);