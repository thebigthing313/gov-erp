create table public.user_permissions(
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    permission_name text not null references public.permissions(id) on delete cascade,
    constraint unique_user_permission unique (user_id, permission_name)
);



