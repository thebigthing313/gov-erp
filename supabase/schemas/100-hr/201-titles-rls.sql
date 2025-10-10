alter table public.titles enable row level security;

create policy "Auth users can view"
on public.titles
for select
to authenticated
using (true);

create policy "Require hr_functions to update"
on public.titles
for update
to authenticated
using (has_permission('hr_functions'))
with check (has_permission('hr_functions'));

create policy "Require hr_functions to insert"
on public.titles
for insert
to authenticated
with check (has_permission('hr_functions'));

create policy "Require hr_functions to delete"
on public.titles
for delete
to authenticated
using (has_permission('hr_functions'));