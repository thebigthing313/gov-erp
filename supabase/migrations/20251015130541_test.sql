set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.employee_id_to_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION private.encrypt_ssn_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    encryption_key text;
begin
    if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and NEW.ssn_hash is distinct from OLD.ssn_hash) THEN
        encryption_key := private.get_ssn_key();

        if encryption_key is null then
            raise exception 'Encryption key named "ssn_key" not found in the vault.';
        end if;

        NEW.ssn_hash := extensions.pgp_sym_encrypt(NEW.ssn_hash, encryption_key);
    end if;

    return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.get_ssn_key()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    encryption_key text;
begin
    select decrypted_secret
    into encryption_key
    from vault.decrypted_secrets
    where name = 'ssn_key'
    limit 1;

    if encryption_key is null then
        raise exception 'Encryption key named "ssn_key" not found in the vault.';
    end if;

    return encryption_key;
end
$function$
;

CREATE OR REPLACE FUNCTION private.user_permissions_to_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    -- Variable to hold the UUID of the user to be updated
    target_user_id uuid;
    -- Variable to hold the aggregated list of permissions
    permission_list text[];
    -- Variable to hold the current raw_app_meta_data
    current_metadata jsonb;
begin
    -- 1. DETERMINE THE TARGET USER_ID
    -- We need the user_id that was affected by the CUD operation.
    if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
        target_user_id := new.user_id;
    elsif (tg_op = 'DELETE') then
        target_user_id := old.user_id;
    else
        return null;
    end if;

    -- Exit if no user_id is found
    if target_user_id is null then
        return null;
    end if;

    -- 2. RE-AGGREGATE ALL CURRENT PERMISSIONS FOR THE USER
    -- Selects all distinct permission names linked to the user_id
    select array_agg(up.permission_name) into permission_list
    from public.user_permissions up
    where up.user_id = target_user_id;

    -- If permission_list is null (user has no permissions), initialize it to an empty array
    if permission_list is null then
        permission_list := '{}';
    end if;

    -- 3. FETCH CURRENT METADATA
    -- Get the current raw_app_meta_data for the user
    select raw_app_meta_data into current_metadata
    from auth.users
    where id = target_user_id;

    -- If the user doesn't exist or has no metadata, initialize to empty JSONB
    if not found or current_metadata is null then
        current_metadata := '{}'::jsonb;
    end if;

    -- 4. UPDATE METADATA WITH THE NEW PERMISSION LIST
    -- Convert the PostgreSQL TEXT array (permission_list) into a JSON array,
    -- then use jsonb_set to replace the entire "permissions" array in the metadata.
    current_metadata := jsonb_set(
        current_metadata,
        '{permissions}',
        to_jsonb(permission_list),
        true -- create_missing
    );

    -- 5. APPLY CHANGES TO auth.users
    update auth.users
    set
        raw_app_meta_data = current_metadata,
        updated_at = now()
    where id = target_user_id;

    -- The trigger function must return the NEW or OLD row
    if tg_op = 'DELETE' then
        return old;
    end if;

    return new;
end;
$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrypt_ssn(p_data text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
    encryption_key text;
    decrypted_ssn text;
begin
    select decrypted_secret
    into encryption_key
    from vault.decrypted_secrets
    where name = 'ssn_key'
    limit 1;

    if encryption_key is null then
        raise exception 'Encryption key named "ssn_key" not found in the vault.';
    end if;

    decrypted_ssn := extensions.pgp_sym_decrypt(p_data::bytea, encryption_key);

    return decrypted_ssn;
end
$function$
;

CREATE OR REPLACE FUNCTION public.employee_user_id(p_employee_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
  declare
    v_user_id uuid;
  begin
    select user_id
    into v_user_id
    from public.employees
    where id = p_employee_id;
    return v_user_id;
  end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_employee_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.has_permission(p_permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
    -- Get the current user's JWT claims as JSONB
    user_claims jsonb := current_setting('request.jwt.claims', true)::jsonb;
    has_permission boolean;
begin
    -- 1. Check if the permission name exists within the 'permissions' array
    --    inside the 'app_metadata' of the JWT claims.

    -- The structure we are checking:
    -- request.jwt.claims -> app_metadata -> permissions -> [ 'perm_a', 'perm_b' ]

    select coalesce((user_claims -> 'app_metadata' -> 'permissions')::jsonb @> to_jsonb(array[p_permission_name]), false)
    into has_permission;

    -- The operator @> checks if the left JSONB value contains the right JSONB value.
    -- Here, we check if the permissions array contains a single-element array
    -- created from the input permission name.
    -- coalesce is used to return false if the permissions array is missing.

    return has_permission;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_employees_modified_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
        begin 
            NEW.modified_at = now();
            return NEW;
        end;
    $function$
;

CREATE OR REPLACE FUNCTION public.update_pay_period_modified_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
        begin 
            NEW.modified_at = now();
            return NEW;
        end;
    $function$
;

CREATE OR REPLACE FUNCTION public.update_starting_balances_modified_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
        begin 
            NEW.modified_at = now();
            return NEW;
        end;
    $function$
;

CREATE OR REPLACE FUNCTION public.update_titles_modified_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
        begin 
            NEW.modified_at = now();
            return NEW;
        end;
    $function$
;

CREATE OR REPLACE FUNCTION public.verify_timesheet_date(p_timesheet_date date, p_pay_period_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO ''
AS $function$
        select exists (
            select 1 
            from public.pay_periods pp
            where pp.id = p_pay_period_id
            and p_timesheet_date between pp.begin_date and pp.end_date
        );
    $function$
;


