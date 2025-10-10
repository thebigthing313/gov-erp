create or replace function private.employee_id_to_metadata()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
    -- Variable to hold the UUID of the user to be updated
    user_id uuid;
    -- Variable to hold the employee_id UUID being added or removed
    employee_uuid uuid;
    -- Variable to hold the current raw_app_meta_data
    current_metadata jsonb;
begin
    -- 1. DETERMINE OPERATION AND GET RELEVANT DATA

    -- For INSERT or UPDATE, the employee_id is in the NEW row
    if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
        -- Assuming the table has a 'user_id' column that links to auth.users
        user_id := new.user_id;
        employee_uuid := new.id;
    -- For DELETE, the employee_id is in the OLD row
    elsif (tg_op = 'DELETE') then
        user_id := old.user_id;
        employee_uuid := old.id;
    else
        -- Should not happen, but for safety
        return null;
    end if;

    -- Exit if no user_id is found
    if user_id is null then
        return null;
    end if;

    -- 2. FETCH CURRENT METADATA

    -- Get the current raw_app_meta_data for the user
    select raw_app_meta_data into current_metadata
    from auth.users
    where id = user_id;

    -- If the user doesn't exist or has no metadata, exit (or initialize to empty JSONB if preferred)
    if not found or current_metadata is null then
        current_metadata := '{}'::jsonb;
    end if;

    -- 3. UPDATE METADATA BASED ON OPERATION

    if (tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.id is not null)) then
        -- Add or update the "employee_id" in raw_app_meta_data
        -- The value is stored as a JSON string
        current_metadata := jsonb_set(
            current_metadata,
            '{employee_id}',
            to_jsonb(employee_uuid::text),
            true -- create_missing
        );
    elsif (tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.id is null)) then
        -- Remove the "employee_id" key from raw_app_meta_data
        current_metadata := current_metadata - 'employee_id';
    end if;

    -- 4. APPLY CHANGES TO auth.users

    update auth.users
    set
        raw_app_meta_data = current_metadata,
        -- Also update the 'updated_at' column to reflect the change
        updated_at = now()
    where id = user_id;

    -- The trigger function must return the NEW or OLD row
    if tg_op = 'DELETE' then
        return old;
    end if;

    return new;
end;
$$;

create trigger employee_id_to_metadata_trigger
after insert or update or delete on public.employees
for each row
execute function private.employee_id_to_metadata();