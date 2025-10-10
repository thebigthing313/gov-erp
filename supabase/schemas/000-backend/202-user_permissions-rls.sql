alter table public.user_permissions enable row level security;

create policy "Auth users can view permissions"
on public.user_permissions
for select
to authenticated
using (true);

create policy "User with permission can insert"
on public.user_permissions
for insert
to authenticated
with check ( has_permission('manage_permissions'));

create policy "Block all updates"
on public.user_permissions
for update
to authenticated, anon
using ( false );

create policy "User with permission can delete"
on public.user_permissions
for delete
to authenticated
using ( has_permission('manage_permissions'));