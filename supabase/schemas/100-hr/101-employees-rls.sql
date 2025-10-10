alter table public.employees enable row level security;

create function update_employees_modified_at()
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

create trigger updated_employees
    before update
    on public.employees
    for each row
    execute function update_employees_modified_at();

create trigger encrypt_ssn_trigger
    before insert or update
    on public.employees
    for each row
    execute function private.encrypt_ssn_trigger();


create policy "Auth users can view own personal data, or hr_functions"
on public.employees
for select
to authenticated
using (((SELECT auth.uid()) = user_id) or has_permission('hr_functions'));

create policy "Require hr_functions to update"
on public.employees
for update
to authenticated
using (has_permission('hr_functions'))
with check (has_permission('hr_functions'));

create policy "Require hr_functions to insert"
on public.employees
for insert
to authenticated
with check (has_permission('hr_functions'));

create policy "Require hr_functions to delete"
on public.employees
for delete
to authenticated
using (has_permission('hr_functions'));