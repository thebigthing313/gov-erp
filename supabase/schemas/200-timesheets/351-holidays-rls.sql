alter table public.holidays enable row level security;

create policy "select: all authenticated users"
    on public.holidays
    for select
    to authenticated
    using (true);

create policy "insert: timesheet_functions"
    on public.holidays
    for insert
    to authenticated
    with check (public.has_permission('timesheet_functions'));

create policy "update: timesheet_functions"
    on public.holidays
    for update
    to authenticated
    using (public.has_permission('timesheet_functions'))
    with check (public.has_permission('timesheet_functions'));

create policy "delete: timesheet_functions"
    on public.holidays
    for delete
    to authenticated
    using (public.has_permission('timesheet_functions'));