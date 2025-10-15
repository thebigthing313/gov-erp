set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrypt_ssn(p_employee_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    encryption_key text;
    encrypted_ssn text;
    decrypted_ssn text;
    current_role_name text;
begin
    -- Get current role
    current_role_name := current_user;
    
    -- Check if role is postgres or service_role, bypass permission check if so
    if current_role_name not in ('postgres', 'service_role') then
        -- Check if user is accessing their own SSN
        if public.get_employee_id() = p_employee_id then
            -- User is accessing their own SSN, allow access
            null; -- No additional permission check needed
        else
            -- Run permission check for accessing other employees' data
            if not public.has_permission('hr_functions') then
                raise exception 'Access denied: insufficient permissions.';
            end if;
        end if;
    end if;

    -- Retrieve encryption key from vault
    select decrypted_secret
    into encryption_key
    from vault.decrypted_secrets
    where name = 'ssn_key'
    limit 1;

    if encryption_key is null then
        raise exception 'Encryption key named "ssn_key" not found in the vault.';
    end if;

    -- Pull the encrypted SSN hash for the specified employee
    select ssn_hash
    into encrypted_ssn
    from public.employees
    where id = p_employee_id
    limit 1;

    if encrypted_ssn is null then
        raise exception 'Employee not found or SSN not available for employee ID: %', p_employee_id;
    end if;

    -- Decrypt the SSN
    decrypted_ssn := extensions.pgp_sym_decrypt(encrypted_ssn::bytea, encryption_key);

    return decrypted_ssn;
end
$function$
;


