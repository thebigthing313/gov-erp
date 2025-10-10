alter table public.timesheets enable row level security;

create policy "Users can view timesheets"
on public.timesheets
for select
to authenticated
using (true);

create policy "timesheet_functions to insert"
on public.timesheets
for insert
to authenticated
with check (has_permission('timesheet_functions'));

create policy "timesheet_functions to update"
on public.timesheets
for update
to authenticated
using (has_permission('timesheet_functions'))
with check(has_permission('timesheet_functions'));

create policy "timesheet_functions to delete"
on public.timesheets
for delete
to authenticated
using (has_permission('timesheet_functions'));