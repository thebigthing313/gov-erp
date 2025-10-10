create or replace function employee_user_id(p_employee_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
  declare
    v_user_id uuid;
  begin
    select user_id
    into v_user_id
    from public.employees
    where id = p_employee_id;
    return v_user_id;
  end;
$$;

create or replace function get_employee_id()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
    -- Get the current user's JWT claims as JSONB
    user_claims jsonb := current_setting('request.jwt.claims', true)::jsonb;
    employee_uuid text;
begin
    -- 1. Extract the 'employee_id' value from the JWT's app_metadata
    -- Structure: request.jwt.claims -> app_metadata -> employee_id (text string)
    employee_uuid := user_claims -> 'app_metadata' ->> 'employee_id';

    -- 2. Check if the value was found and return it as a UUID
    if employee_uuid is not null then
        return employee_uuid::uuid;
    end if;

    -- Return NULL if the employee_id claim is not found
    return null;
end;
$$;