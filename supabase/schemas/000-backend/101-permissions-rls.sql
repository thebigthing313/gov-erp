alter table public.permissions enable row level security;

create policy "Auth user can view permissions"
on public.permissions
for select
to authenticated
using (true);

create policy "Block insert into permissions"
on public.permissions
for insert 
to authenticated, anon
with check (false);

create policy "Block update permissions"
on public.permissions
for update
to authenticated, anon
with check (false);

create policy "Block delete permissions"
on public.permissions
for delete
to authenticated, anon
using (false);