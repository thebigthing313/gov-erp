create function public.decrypt_ssn(p_data text)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
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
$$;

revoke all on function public.decrypt_ssn from public, anon, authenticated;
grant execute on function public.decrypt_ssn to service_role;