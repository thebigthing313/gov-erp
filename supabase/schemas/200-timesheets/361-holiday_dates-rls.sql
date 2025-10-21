alter table public.holiday_dates enable row level security;

create policy "select: all authenticated users"
    on public.holiday_dates
    for select
    to authenticated
    using (true);

create policy "insert: timesheet_functions"
    on public.holiday_dates
    for insert
    to authenticated
    with check (public.has_permission('timesheet_functions'));

create policy "update: timesheet_functions"
    on public.holiday_dates
    for update
    to authenticated
    using (public.has_permission('timesheet_functions'))
    with check (public.has_permission('timesheet_functions'));

create policy "delete: timesheet_functions"
    on public.holiday_dates
    for delete
    to authenticated
    using (public.has_permission('timesheet_functions'));