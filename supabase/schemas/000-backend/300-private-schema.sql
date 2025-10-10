create schema private;
revoke all on schema private from public;
grant usage on schema private to service_role;

create function private.get_ssn_key()
returns text
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create or replace function private.encrypt_ssn_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
$$;



revoke execute on function private.encrypt_ssn_trigger from anon, authenticated;
revoke execute on function private.get_ssn_key from anon, authenticated;