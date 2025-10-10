create schema if not exists "private";

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


create type "public"."title_status" as enum ('permanent', 'part-time', 'seasonal', 'provisional', 'volunteer');

create table "public"."employee_titles" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "employee_id" uuid not null,
    "title_id" uuid not null,
    "title_status" title_status not null,
    "start_date" date not null,
    "end_date" date
);


alter table "public"."employee_titles" enable row level security;

create table "public"."employees" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "first_name" text not null,
    "middle_name" text,
    "last_name" text not null,
    "ssn_hash" text not null,
    "birth_date" date not null,
    "home_address" text not null,
    "mailing_address" text,
    "email_address" text,
    "home_phone" text,
    "cell_phone" text,
    "photo_url" text,
    "csc_id" text,
    "pers_membership_number" text,
    "pers_tier" text,
    "user_id" uuid,
    "is_default_cto" boolean not null default false
);


alter table "public"."employees" enable row level security;

create table "public"."pay_periods" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "payroll_year" smallint not null,
    "pay_period_number" smallint not null,
    "begin_date" date not null,
    "end_date" date not null,
    "pay_date" date not null
);


alter table "public"."pay_periods" enable row level security;

create table "public"."permissions" (
    "id" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."permissions" enable row level security;

create table "public"."starting_balances" (
    "id" uuid not null default gen_random_uuid(),
    "payroll_year" smallint not null,
    "employee_id" uuid not null,
    "time_type_id" uuid not null,
    "starting_balance" numeric(8,2) not null default 0,
    "created_at" timestamp with time zone default now(),
    "modified_at" timestamp with time zone default now()
);


alter table "public"."starting_balances" enable row level security;

create table "public"."time_types" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "type_name" text not null,
    "type_short_name" text not null,
    "is_paid" boolean not null
);


alter table "public"."time_types" enable row level security;

create table "public"."timesheet_employee_times" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "timesheet_employee_id" uuid not null,
    "time_type_id" uuid not null,
    "hours_amount" double precision not null default 0
);


alter table "public"."timesheet_employee_times" enable row level security;

create table "public"."timesheet_employees" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "timesheet_id" uuid not null,
    "employee_id" uuid not null,
    "is_late" boolean not null default false,
    "notes" text
);


alter table "public"."timesheet_employees" enable row level security;

create table "public"."timesheets" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "pay_period_id" uuid not null,
    "timesheet_date" date not null,
    "notes" text
);


alter table "public"."timesheets" enable row level security;

create table "public"."titles" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now(),
    "title_name" text not null,
    "is_clerical" boolean not null default false,
    "is_salaried" boolean not null default false,
    "minimum_annual_salary" numeric(12,2),
    "maximum_annual_salary" numeric(12,2),
    "title_description_url" text,
    "csc_code" text not null,
    "csc_description_url" text
);


alter table "public"."titles" enable row level security;

create table "public"."user_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "permission_name" text not null
);


alter table "public"."user_permissions" enable row level security;

CREATE UNIQUE INDEX employee_titles_pkey ON public.employee_titles USING btree (id);

CREATE UNIQUE INDEX employees_pkey ON public.employees USING btree (id);

CREATE UNIQUE INDEX pay_periods_pkey ON public.pay_periods USING btree (id);

CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);

CREATE UNIQUE INDEX starting_balances_pkey ON public.starting_balances USING btree (id);

CREATE UNIQUE INDEX time_types_pkey ON public.time_types USING btree (id);

CREATE UNIQUE INDEX timesheet_employee_times_pkey ON public.timesheet_employee_times USING btree (id);

CREATE UNIQUE INDEX timesheet_employees_pkey ON public.timesheet_employees USING btree (id);

CREATE UNIQUE INDEX timesheets_pkey ON public.timesheets USING btree (id);

CREATE UNIQUE INDEX timesheets_timesheet_date_key ON public.timesheets USING btree (timesheet_date);

CREATE UNIQUE INDEX titles_pkey ON public.titles USING btree (id);

CREATE UNIQUE INDEX unique_code ON public.titles USING btree (csc_code);

CREATE UNIQUE INDEX unique_pay_period ON public.pay_periods USING btree (payroll_year, pay_period_number);

CREATE UNIQUE INDEX unique_starting_balance ON public.starting_balances USING btree (payroll_year, employee_id, time_type_id);

CREATE UNIQUE INDEX unique_timesheet_employee ON public.timesheet_employees USING btree (timesheet_id, employee_id);

CREATE UNIQUE INDEX unique_timesheet_employee_time ON public.timesheet_employee_times USING btree (timesheet_employee_id, time_type_id);

CREATE UNIQUE INDEX unique_title ON public.titles USING btree (title_name);

CREATE UNIQUE INDEX unique_type ON public.time_types USING btree (type_name);

CREATE UNIQUE INDEX unique_user_permission ON public.user_permissions USING btree (user_id, permission_name);

CREATE UNIQUE INDEX user_permissions_pkey ON public.user_permissions USING btree (id);

alter table "public"."employee_titles" add constraint "employee_titles_pkey" PRIMARY KEY using index "employee_titles_pkey";

alter table "public"."employees" add constraint "employees_pkey" PRIMARY KEY using index "employees_pkey";

alter table "public"."pay_periods" add constraint "pay_periods_pkey" PRIMARY KEY using index "pay_periods_pkey";

alter table "public"."permissions" add constraint "permissions_pkey" PRIMARY KEY using index "permissions_pkey";

alter table "public"."starting_balances" add constraint "starting_balances_pkey" PRIMARY KEY using index "starting_balances_pkey";

alter table "public"."time_types" add constraint "time_types_pkey" PRIMARY KEY using index "time_types_pkey";

alter table "public"."timesheet_employee_times" add constraint "timesheet_employee_times_pkey" PRIMARY KEY using index "timesheet_employee_times_pkey";

alter table "public"."timesheet_employees" add constraint "timesheet_employees_pkey" PRIMARY KEY using index "timesheet_employees_pkey";

alter table "public"."timesheets" add constraint "timesheets_pkey" PRIMARY KEY using index "timesheets_pkey";

alter table "public"."titles" add constraint "titles_pkey" PRIMARY KEY using index "titles_pkey";

alter table "public"."user_permissions" add constraint "user_permissions_pkey" PRIMARY KEY using index "user_permissions_pkey";

alter table "public"."employee_titles" add constraint "employee_titles_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE not valid;

alter table "public"."employee_titles" validate constraint "employee_titles_employee_id_fkey";

alter table "public"."employee_titles" add constraint "employee_titles_title_id_fkey" FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE not valid;

alter table "public"."employee_titles" validate constraint "employee_titles_title_id_fkey";

alter table "public"."employee_titles" add constraint "valid_end_date" CHECK ((end_date >= start_date)) not valid;

alter table "public"."employee_titles" validate constraint "valid_end_date";

alter table "public"."employees" add constraint "birth_date_past" CHECK ((birth_date < now())) not valid;

alter table "public"."employees" validate constraint "birth_date_past";

alter table "public"."employees" add constraint "employees_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."employees" validate constraint "employees_user_id_fkey";

alter table "public"."employees" add constraint "first_name_length" CHECK ((length(first_name) >= 2)) not valid;

alter table "public"."employees" validate constraint "first_name_length";

alter table "public"."employees" add constraint "last_name_length" CHECK ((length(last_name) >= 2)) not valid;

alter table "public"."employees" validate constraint "last_name_length";

alter table "public"."pay_periods" add constraint "unique_pay_period" UNIQUE using index "unique_pay_period";

alter table "public"."pay_periods" add constraint "valid_dates" CHECK ((begin_date < end_date)) not valid;

alter table "public"."pay_periods" validate constraint "valid_dates";

alter table "public"."pay_periods" add constraint "valid_pay_date" CHECK ((pay_date >= end_date)) not valid;

alter table "public"."pay_periods" validate constraint "valid_pay_date";

alter table "public"."starting_balances" add constraint "starting_balance_not_negative" CHECK ((starting_balance >= (0)::numeric)) not valid;

alter table "public"."starting_balances" validate constraint "starting_balance_not_negative";

alter table "public"."starting_balances" add constraint "starting_balances_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE not valid;

alter table "public"."starting_balances" validate constraint "starting_balances_employee_id_fkey";

alter table "public"."starting_balances" add constraint "starting_balances_time_type_id_fkey" FOREIGN KEY (time_type_id) REFERENCES time_types(id) ON DELETE CASCADE not valid;

alter table "public"."starting_balances" validate constraint "starting_balances_time_type_id_fkey";

alter table "public"."starting_balances" add constraint "unique_starting_balance" UNIQUE using index "unique_starting_balance";

alter table "public"."time_types" add constraint "unique_type" UNIQUE using index "unique_type";

alter table "public"."timesheet_employee_times" add constraint "timesheet_employee_times_time_type_id_fkey" FOREIGN KEY (time_type_id) REFERENCES time_types(id) not valid;

alter table "public"."timesheet_employee_times" validate constraint "timesheet_employee_times_time_type_id_fkey";

alter table "public"."timesheet_employee_times" add constraint "timesheet_employee_times_timesheet_employee_id_fkey" FOREIGN KEY (timesheet_employee_id) REFERENCES timesheet_employees(id) not valid;

alter table "public"."timesheet_employee_times" validate constraint "timesheet_employee_times_timesheet_employee_id_fkey";

alter table "public"."timesheet_employee_times" add constraint "unique_timesheet_employee_time" UNIQUE using index "unique_timesheet_employee_time";

alter table "public"."timesheet_employees" add constraint "timesheet_employees_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES employees(id) not valid;

alter table "public"."timesheet_employees" validate constraint "timesheet_employees_employee_id_fkey";

alter table "public"."timesheet_employees" add constraint "timesheet_employees_timesheet_id_fkey" FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) not valid;

alter table "public"."timesheet_employees" validate constraint "timesheet_employees_timesheet_id_fkey";

alter table "public"."timesheet_employees" add constraint "unique_timesheet_employee" UNIQUE using index "unique_timesheet_employee";





alter table "public"."timesheets" add constraint "timesheets_pay_period_id_fkey" FOREIGN KEY (pay_period_id) REFERENCES pay_periods(id) not valid;

alter table "public"."timesheets" validate constraint "timesheets_pay_period_id_fkey";

alter table "public"."timesheets" add constraint "timesheets_timesheet_date_key" UNIQUE using index "timesheets_timesheet_date_key";

alter table "public"."titles" add constraint "unique_code" UNIQUE using index "unique_code";

alter table "public"."titles" add constraint "unique_title" UNIQUE using index "unique_title";

alter table "public"."user_permissions" add constraint "unique_user_permission" UNIQUE using index "unique_user_permission";

alter table "public"."user_permissions" add constraint "user_permissions_permission_name_fkey" FOREIGN KEY (permission_name) REFERENCES permissions(id) ON DELETE CASCADE not valid;

alter table "public"."user_permissions" validate constraint "user_permissions_permission_name_fkey";

alter table "public"."user_permissions" add constraint "user_permissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_permissions" validate constraint "user_permissions_user_id_fkey";

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

grant delete on table "public"."employee_titles" to "anon";

grant insert on table "public"."employee_titles" to "anon";

grant references on table "public"."employee_titles" to "anon";

grant select on table "public"."employee_titles" to "anon";

grant trigger on table "public"."employee_titles" to "anon";

grant truncate on table "public"."employee_titles" to "anon";

grant update on table "public"."employee_titles" to "anon";

grant delete on table "public"."employee_titles" to "authenticated";

grant insert on table "public"."employee_titles" to "authenticated";

grant references on table "public"."employee_titles" to "authenticated";

grant select on table "public"."employee_titles" to "authenticated";

grant trigger on table "public"."employee_titles" to "authenticated";

grant truncate on table "public"."employee_titles" to "authenticated";

grant update on table "public"."employee_titles" to "authenticated";

grant delete on table "public"."employee_titles" to "service_role";

grant insert on table "public"."employee_titles" to "service_role";

grant references on table "public"."employee_titles" to "service_role";

grant select on table "public"."employee_titles" to "service_role";

grant trigger on table "public"."employee_titles" to "service_role";

grant truncate on table "public"."employee_titles" to "service_role";

grant update on table "public"."employee_titles" to "service_role";

grant delete on table "public"."employees" to "anon";

grant insert on table "public"."employees" to "anon";

grant references on table "public"."employees" to "anon";

grant select on table "public"."employees" to "anon";

grant trigger on table "public"."employees" to "anon";

grant truncate on table "public"."employees" to "anon";

grant update on table "public"."employees" to "anon";

grant delete on table "public"."employees" to "authenticated";

grant insert on table "public"."employees" to "authenticated";

grant references on table "public"."employees" to "authenticated";

grant select on table "public"."employees" to "authenticated";

grant trigger on table "public"."employees" to "authenticated";

grant truncate on table "public"."employees" to "authenticated";

grant update on table "public"."employees" to "authenticated";

grant delete on table "public"."employees" to "service_role";

grant insert on table "public"."employees" to "service_role";

grant references on table "public"."employees" to "service_role";

grant select on table "public"."employees" to "service_role";

grant trigger on table "public"."employees" to "service_role";

grant truncate on table "public"."employees" to "service_role";

grant update on table "public"."employees" to "service_role";

grant delete on table "public"."pay_periods" to "anon";

grant insert on table "public"."pay_periods" to "anon";

grant references on table "public"."pay_periods" to "anon";

grant select on table "public"."pay_periods" to "anon";

grant trigger on table "public"."pay_periods" to "anon";

grant truncate on table "public"."pay_periods" to "anon";

grant update on table "public"."pay_periods" to "anon";

grant delete on table "public"."pay_periods" to "authenticated";

grant insert on table "public"."pay_periods" to "authenticated";

grant references on table "public"."pay_periods" to "authenticated";

grant select on table "public"."pay_periods" to "authenticated";

grant trigger on table "public"."pay_periods" to "authenticated";

grant truncate on table "public"."pay_periods" to "authenticated";

grant update on table "public"."pay_periods" to "authenticated";

grant delete on table "public"."pay_periods" to "service_role";

grant insert on table "public"."pay_periods" to "service_role";

grant references on table "public"."pay_periods" to "service_role";

grant select on table "public"."pay_periods" to "service_role";

grant trigger on table "public"."pay_periods" to "service_role";

grant truncate on table "public"."pay_periods" to "service_role";

grant update on table "public"."pay_periods" to "service_role";

grant delete on table "public"."permissions" to "anon";

grant insert on table "public"."permissions" to "anon";

grant references on table "public"."permissions" to "anon";

grant select on table "public"."permissions" to "anon";

grant trigger on table "public"."permissions" to "anon";

grant truncate on table "public"."permissions" to "anon";

grant update on table "public"."permissions" to "anon";

grant delete on table "public"."permissions" to "authenticated";

grant insert on table "public"."permissions" to "authenticated";

grant references on table "public"."permissions" to "authenticated";

grant select on table "public"."permissions" to "authenticated";

grant trigger on table "public"."permissions" to "authenticated";

grant truncate on table "public"."permissions" to "authenticated";

grant update on table "public"."permissions" to "authenticated";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant references on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant trigger on table "public"."permissions" to "service_role";

grant truncate on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."starting_balances" to "anon";

grant insert on table "public"."starting_balances" to "anon";

grant references on table "public"."starting_balances" to "anon";

grant select on table "public"."starting_balances" to "anon";

grant trigger on table "public"."starting_balances" to "anon";

grant truncate on table "public"."starting_balances" to "anon";

grant update on table "public"."starting_balances" to "anon";

grant delete on table "public"."starting_balances" to "authenticated";

grant insert on table "public"."starting_balances" to "authenticated";

grant references on table "public"."starting_balances" to "authenticated";

grant select on table "public"."starting_balances" to "authenticated";

grant trigger on table "public"."starting_balances" to "authenticated";

grant truncate on table "public"."starting_balances" to "authenticated";

grant update on table "public"."starting_balances" to "authenticated";

grant delete on table "public"."starting_balances" to "service_role";

grant insert on table "public"."starting_balances" to "service_role";

grant references on table "public"."starting_balances" to "service_role";

grant select on table "public"."starting_balances" to "service_role";

grant trigger on table "public"."starting_balances" to "service_role";

grant truncate on table "public"."starting_balances" to "service_role";

grant update on table "public"."starting_balances" to "service_role";

grant delete on table "public"."time_types" to "anon";

grant insert on table "public"."time_types" to "anon";

grant references on table "public"."time_types" to "anon";

grant select on table "public"."time_types" to "anon";

grant trigger on table "public"."time_types" to "anon";

grant truncate on table "public"."time_types" to "anon";

grant update on table "public"."time_types" to "anon";

grant delete on table "public"."time_types" to "authenticated";

grant insert on table "public"."time_types" to "authenticated";

grant references on table "public"."time_types" to "authenticated";

grant select on table "public"."time_types" to "authenticated";

grant trigger on table "public"."time_types" to "authenticated";

grant truncate on table "public"."time_types" to "authenticated";

grant update on table "public"."time_types" to "authenticated";

grant delete on table "public"."time_types" to "service_role";

grant insert on table "public"."time_types" to "service_role";

grant references on table "public"."time_types" to "service_role";

grant select on table "public"."time_types" to "service_role";

grant trigger on table "public"."time_types" to "service_role";

grant truncate on table "public"."time_types" to "service_role";

grant update on table "public"."time_types" to "service_role";

grant delete on table "public"."timesheet_employee_times" to "anon";

grant insert on table "public"."timesheet_employee_times" to "anon";

grant references on table "public"."timesheet_employee_times" to "anon";

grant select on table "public"."timesheet_employee_times" to "anon";

grant trigger on table "public"."timesheet_employee_times" to "anon";

grant truncate on table "public"."timesheet_employee_times" to "anon";

grant update on table "public"."timesheet_employee_times" to "anon";

grant delete on table "public"."timesheet_employee_times" to "authenticated";

grant insert on table "public"."timesheet_employee_times" to "authenticated";

grant references on table "public"."timesheet_employee_times" to "authenticated";

grant select on table "public"."timesheet_employee_times" to "authenticated";

grant trigger on table "public"."timesheet_employee_times" to "authenticated";

grant truncate on table "public"."timesheet_employee_times" to "authenticated";

grant update on table "public"."timesheet_employee_times" to "authenticated";

grant delete on table "public"."timesheet_employee_times" to "service_role";

grant insert on table "public"."timesheet_employee_times" to "service_role";

grant references on table "public"."timesheet_employee_times" to "service_role";

grant select on table "public"."timesheet_employee_times" to "service_role";

grant trigger on table "public"."timesheet_employee_times" to "service_role";

grant truncate on table "public"."timesheet_employee_times" to "service_role";

grant update on table "public"."timesheet_employee_times" to "service_role";

grant delete on table "public"."timesheet_employees" to "anon";

grant insert on table "public"."timesheet_employees" to "anon";

grant references on table "public"."timesheet_employees" to "anon";

grant select on table "public"."timesheet_employees" to "anon";

grant trigger on table "public"."timesheet_employees" to "anon";

grant truncate on table "public"."timesheet_employees" to "anon";

grant update on table "public"."timesheet_employees" to "anon";

grant delete on table "public"."timesheet_employees" to "authenticated";

grant insert on table "public"."timesheet_employees" to "authenticated";

grant references on table "public"."timesheet_employees" to "authenticated";

grant select on table "public"."timesheet_employees" to "authenticated";

grant trigger on table "public"."timesheet_employees" to "authenticated";

grant truncate on table "public"."timesheet_employees" to "authenticated";

grant update on table "public"."timesheet_employees" to "authenticated";

grant delete on table "public"."timesheet_employees" to "service_role";

grant insert on table "public"."timesheet_employees" to "service_role";

grant references on table "public"."timesheet_employees" to "service_role";

grant select on table "public"."timesheet_employees" to "service_role";

grant trigger on table "public"."timesheet_employees" to "service_role";

grant truncate on table "public"."timesheet_employees" to "service_role";

grant update on table "public"."timesheet_employees" to "service_role";

grant delete on table "public"."timesheets" to "anon";

grant insert on table "public"."timesheets" to "anon";

grant references on table "public"."timesheets" to "anon";

grant select on table "public"."timesheets" to "anon";

grant trigger on table "public"."timesheets" to "anon";

grant truncate on table "public"."timesheets" to "anon";

grant update on table "public"."timesheets" to "anon";

grant delete on table "public"."timesheets" to "authenticated";

grant insert on table "public"."timesheets" to "authenticated";

grant references on table "public"."timesheets" to "authenticated";

grant select on table "public"."timesheets" to "authenticated";

grant trigger on table "public"."timesheets" to "authenticated";

grant truncate on table "public"."timesheets" to "authenticated";

grant update on table "public"."timesheets" to "authenticated";

grant delete on table "public"."timesheets" to "service_role";

grant insert on table "public"."timesheets" to "service_role";

grant references on table "public"."timesheets" to "service_role";

grant select on table "public"."timesheets" to "service_role";

grant trigger on table "public"."timesheets" to "service_role";

grant truncate on table "public"."timesheets" to "service_role";

grant update on table "public"."timesheets" to "service_role";

grant delete on table "public"."titles" to "anon";

grant insert on table "public"."titles" to "anon";

grant references on table "public"."titles" to "anon";

grant select on table "public"."titles" to "anon";

grant trigger on table "public"."titles" to "anon";

grant truncate on table "public"."titles" to "anon";

grant update on table "public"."titles" to "anon";

grant delete on table "public"."titles" to "authenticated";

grant insert on table "public"."titles" to "authenticated";

grant references on table "public"."titles" to "authenticated";

grant select on table "public"."titles" to "authenticated";

grant trigger on table "public"."titles" to "authenticated";

grant truncate on table "public"."titles" to "authenticated";

grant update on table "public"."titles" to "authenticated";

grant delete on table "public"."titles" to "service_role";

grant insert on table "public"."titles" to "service_role";

grant references on table "public"."titles" to "service_role";

grant select on table "public"."titles" to "service_role";

grant trigger on table "public"."titles" to "service_role";

grant truncate on table "public"."titles" to "service_role";

grant update on table "public"."titles" to "service_role";

grant delete on table "public"."user_permissions" to "anon";

grant insert on table "public"."user_permissions" to "anon";

grant references on table "public"."user_permissions" to "anon";

grant select on table "public"."user_permissions" to "anon";

grant trigger on table "public"."user_permissions" to "anon";

grant truncate on table "public"."user_permissions" to "anon";

grant update on table "public"."user_permissions" to "anon";

grant delete on table "public"."user_permissions" to "authenticated";

grant insert on table "public"."user_permissions" to "authenticated";

grant references on table "public"."user_permissions" to "authenticated";

grant select on table "public"."user_permissions" to "authenticated";

grant trigger on table "public"."user_permissions" to "authenticated";

grant truncate on table "public"."user_permissions" to "authenticated";

grant update on table "public"."user_permissions" to "authenticated";

grant delete on table "public"."user_permissions" to "service_role";

grant insert on table "public"."user_permissions" to "service_role";

grant references on table "public"."user_permissions" to "service_role";

grant select on table "public"."user_permissions" to "service_role";

grant trigger on table "public"."user_permissions" to "service_role";

grant truncate on table "public"."user_permissions" to "service_role";

grant update on table "public"."user_permissions" to "service_role";

create policy "Require hr_functions to delete"
on "public"."employee_titles"
as permissive
for delete
to authenticated
using (has_permission('hr_functions'::text));


create policy "Require hr_functions to insert"
on "public"."employee_titles"
as permissive
for insert
to authenticated
with check (has_permission('hr_functions'::text));


create policy "Require hr_functions to update"
on "public"."employee_titles"
as permissive
for update
to authenticated
using (has_permission('hr_functions'::text))
with check (has_permission('hr_functions'::text));


create policy "Users can view own titles, or hr_functions"
on "public"."employee_titles"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = employee_user_id(employee_id)) OR has_permission('hr_functions'::text)));


create policy "Auth users can view own personal data, or hr_functions"
on "public"."employees"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR has_permission('hr_functions'::text)));


create policy "Require hr_functions to delete"
on "public"."employees"
as permissive
for delete
to authenticated
using (has_permission('hr_functions'::text));


create policy "Require hr_functions to insert"
on "public"."employees"
as permissive
for insert
to authenticated
with check (has_permission('hr_functions'::text));


create policy "Require hr_functions to update"
on "public"."employees"
as permissive
for update
to authenticated
using (has_permission('hr_functions'::text))
with check (has_permission('hr_functions'::text));


create policy "Authenticated users can select pay periods"
on "public"."pay_periods"
as permissive
for select
to authenticated
using (true);


create policy "timesheet_functions permission to delete"
on "public"."pay_periods"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "timesheet_functions permission to insert"
on "public"."pay_periods"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "timesheet_functions permission to update"
on "public"."pay_periods"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));


create policy "Auth user can view permissions"
on "public"."permissions"
as permissive
for select
to authenticated
using (true);


create policy "Block delete permissions"
on "public"."permissions"
as permissive
for delete
to authenticated, anon
using (false);


create policy "Block insert into permissions"
on "public"."permissions"
as permissive
for insert
to authenticated, anon
with check (false);


create policy "Block update permissions"
on "public"."permissions"
as permissive
for update
to authenticated, anon
with check (false);


create policy "Users can select own, or timesheet_functions"
on "public"."starting_balances"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = employee_user_id(employee_id)) OR has_permission('timesheet_functions'::text)));


create policy "timesheet_functions to delete"
on "public"."starting_balances"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to insert"
on "public"."starting_balances"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to update"
on "public"."starting_balances"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));


create policy "Authenticated users can select"
on "public"."time_types"
as permissive
for select
to authenticated
using (true);


create policy "Need admin permission to delete"
on "public"."time_types"
as permissive
for delete
to authenticated
using (has_permission('admin'::text));


create policy "Need admin permission to insert"
on "public"."time_types"
as permissive
for insert
to authenticated
with check (has_permission('admin'::text));


create policy "Need admin permission to update"
on "public"."time_types"
as permissive
for update
to authenticated
using (has_permission('admin'::text))
with check (has_permission('admin'::text));


create policy "timesheet_functions to delete"
on "public"."timesheet_employee_times"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to insert"
on "public"."timesheet_employee_times"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to update"
on "public"."timesheet_employee_times"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));


create policy "users can view own"
on "public"."timesheet_employee_times"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = employee_user_id(( SELECT timesheet_employees.employee_id
   FROM timesheet_employees
  WHERE (timesheet_employees.id = timesheet_employee_times.timesheet_employee_id)))) OR has_permission('timesheet_functions'::text)));


create policy "timesheet_functions to delete"
on "public"."timesheet_employees"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to insert"
on "public"."timesheet_employees"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to update"
on "public"."timesheet_employees"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));


create policy "users can view own"
on "public"."timesheet_employees"
as permissive
for select
to authenticated
using (((( SELECT auth.uid() AS uid) = employee_user_id(employee_id)) OR has_permission('timesheet_functions'::text)));


create policy "Users can view timesheets"
on "public"."timesheets"
as permissive
for select
to authenticated
using (true);


create policy "timesheet_functions to delete"
on "public"."timesheets"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to insert"
on "public"."timesheets"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "timesheet_functions to update"
on "public"."timesheets"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));


create policy "Auth users can view"
on "public"."titles"
as permissive
for select
to authenticated
using (true);


create policy "Require hr_functions to delete"
on "public"."titles"
as permissive
for delete
to authenticated
using (has_permission('hr_functions'::text));


create policy "Require hr_functions to insert"
on "public"."titles"
as permissive
for insert
to authenticated
with check (has_permission('hr_functions'::text));


create policy "Require hr_functions to update"
on "public"."titles"
as permissive
for update
to authenticated
using (has_permission('hr_functions'::text))
with check (has_permission('hr_functions'::text));


create policy "Auth users can view permissions"
on "public"."user_permissions"
as permissive
for select
to authenticated
using (true);


create policy "Block all updates"
on "public"."user_permissions"
as permissive
for update
to authenticated, anon
using (false);


create policy "User with permission can delete"
on "public"."user_permissions"
as permissive
for delete
to authenticated
using (has_permission('manage_permissions'::text));


create policy "User with permission can insert"
on "public"."user_permissions"
as permissive
for insert
to authenticated
with check (has_permission('manage_permissions'::text));


CREATE TRIGGER employee_id_to_metadata_trigger AFTER INSERT OR DELETE OR UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION private.employee_id_to_metadata();

CREATE TRIGGER encrypt_ssn_trigger BEFORE INSERT OR UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION private.encrypt_ssn_trigger();

CREATE TRIGGER updated_employees BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_employees_modified_at();

CREATE TRIGGER updated_pay_period BEFORE UPDATE ON public.pay_periods FOR EACH ROW EXECUTE FUNCTION update_pay_period_modified_at();

CREATE TRIGGER updated_starting_balances BEFORE UPDATE ON public.starting_balances FOR EACH ROW EXECUTE FUNCTION update_starting_balances_modified_at();

CREATE TRIGGER updated_titles BEFORE UPDATE ON public.titles FOR EACH ROW EXECUTE FUNCTION update_titles_modified_at();

CREATE TRIGGER user_permissions_to_metadata_trigger AFTER INSERT OR DELETE OR UPDATE ON public.user_permissions FOR EACH ROW EXECUTE FUNCTION private.user_permissions_to_metadata();

alter table "public"."timesheets" add constraint "timesheets_check" CHECK (verify_timesheet_date(timesheet_date, pay_period_id)) not valid;

alter table "public"."timesheets" validate constraint "timesheets_check";