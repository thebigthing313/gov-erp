alter table public.pay_periods enable row level security;

create function update_pay_period_modified_at()
    returns trigger
    language plpgsql
    security invoker
    set search_path = ''
    as $$
        begin 
            NEW.modified_at = now();
            return NEW;
        end;
    $$ ;

create trigger updated_pay_period
    before update
    on public.pay_periods
    for each row
    execute function update_pay_period_modified_at();

create policy "Authenticated users can select pay periods"
on public.pay_periods
for select
to authenticated
using (true);

create policy "timesheet_functions permission to insert"
on public.pay_periods
for insert
to authenticated
with check (has_permission('timesheet_functions'));

create policy "timesheet_functions permission to update"
on public.pay_periods
for update
to authenticated
using (has_permission('timesheet_functions'))
with check (has_permission('timesheet_functions'));

create policy "timesheet_functions permission to delete"
on public.pay_periods
for delete
to authenticated
using (has_permission('timesheet_functions'));