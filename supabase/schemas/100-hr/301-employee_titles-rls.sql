alter table public.employee_titles enable row level security;

create policy "Users can view own titles, or hr_functions"
on public.employee_titles
for select
to authenticated
using (
    ((SELECT auth.uid()) = public.employee_user_id(employee_id)) 
or 
    (has_permission('hr_functions'))
);

create policy "Require hr_functions to update"
on public.employee_titles
for update
to authenticated
using (has_permission('hr_functions'))
with check (has_permission('hr_functions'));

create policy "Require hr_functions to insert"
on public.employee_titles
for insert
to authenticated
with check (has_permission('hr_functions'));

create policy "Require hr_functions to delete"
on public.employee_titles
for delete
to authenticated
using (has_permission('hr_functions'));