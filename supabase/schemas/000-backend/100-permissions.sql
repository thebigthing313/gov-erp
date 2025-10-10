create table public.permissions (
    id text not null primary key,
    description text,
    created_at timestamp with time zone not null default now()    
);



