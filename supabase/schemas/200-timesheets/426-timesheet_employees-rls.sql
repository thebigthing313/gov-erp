alter table public.timesheet_employees enable row level security;

create policy "users can view own"
on public.timesheet_employees
for select
to authenticated
using (
    ((SELECT auth.uid()) = (public.employee_user_id(employee_id)))
    or
    (has_permission('timesheet_functions'))
);

create policy "timesheet_functions to insert"
on public.timesheet_employees
for insert
to authenticated
with check (has_permission('timesheet_functions'));

create policy "timesheet_functions to update"
on public.timesheet_employees
for update
to authenticated
using (has_permission('timesheet_functions'))
with check(has_permission('timesheet_functions'));

create policy "timesheet_functions to delete"
on public.timesheet_employees
for delete
to authenticated
using (has_permission('timesheet_functions'));