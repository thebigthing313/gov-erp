alter table public.time_types enable row level security;

create policy "Authenticated users can select"
on public.time_types
for select
to authenticated
using (true);

create policy "Need admin permission to insert"
on public.time_types
for insert
to authenticated
with check (has_permission('admin'));

create policy "Need admin permission to update"
on public.time_types
for update
to authenticated
using (has_permission('admin'))
with check(has_permission('admin'));

create policy "Need admin permission to delete"
on public.time_types
for delete
to authenticated
using (has_permission('admin'));
