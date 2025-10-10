alter table public.starting_balances enable row level security;

create policy "Users can select own, or timesheet_functions"
on public.starting_balances
for select
to authenticated
using (
    (
        ((select auth.uid()) = (employee_user_id(employee_id))) 
        or has_permission('timesheet_functions')
    )
);

create policy "timesheet_functions to insert"
on public.starting_balances
for insert
to authenticated
with check (has_permission('timesheet_functions'));

create policy "timesheet_functions to update"
on public.starting_balances
for update
to authenticated
using (has_permission('timesheet_functions'))
with check(has_permission('timesheet_functions'));

create policy "timesheet_functions to delete"
on public.starting_balances
for delete
to authenticated
using (has_permission('timesheet_functions'));