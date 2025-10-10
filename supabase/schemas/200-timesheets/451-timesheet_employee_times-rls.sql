alter table public.timesheet_employee_times enable row level security;

create policy "users can view own"
on public.timesheet_employee_times
for select
to authenticated
using (
    ((SELECT auth.uid()) = (
        public.employee_user_id(
            (SELECT timesheet_employees.employee_id FROM public.timesheet_employees WHERE id = timesheet_employee_id)
        )
    ))
    or
    (has_permission('timesheet_functions'))
);

create policy "timesheet_functions to insert"
on public.timesheet_employee_times
for insert
to authenticated
with check (has_permission('timesheet_functions'));

create policy "timesheet_functions to update"
on public.timesheet_employee_times
for update
to authenticated
using (has_permission('timesheet_functions'))
with check(has_permission('timesheet_functions'));

create policy "timesheet_functions to delete"
on public.timesheet_employee_times
for delete
to authenticated
using (has_permission('timesheet_functions'));