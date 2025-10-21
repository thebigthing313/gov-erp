create table "public"."holiday_dates" (
    "id" uuid not null default gen_random_uuid(),
    "holiday_id" uuid not null,
    "holiday_date" date not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."holiday_dates" enable row level security;

create table "public"."holidays" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "definition" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."holidays" enable row level security;

alter table "public"."timesheets" add column "holiday_date_id" uuid;

CREATE UNIQUE INDEX holiday_dates_pkey ON public.holiday_dates USING btree (id);

CREATE UNIQUE INDEX holidays_pkey ON public.holidays USING btree (id);

alter table "public"."holiday_dates" add constraint "holiday_dates_pkey" PRIMARY KEY using index "holiday_dates_pkey";

alter table "public"."holidays" add constraint "holidays_pkey" PRIMARY KEY using index "holidays_pkey";

alter table "public"."holiday_dates" add constraint "holiday_dates_holiday_id_fkey" FOREIGN KEY (holiday_id) REFERENCES holidays(id) ON DELETE CASCADE not valid;

alter table "public"."holiday_dates" validate constraint "holiday_dates_holiday_id_fkey";

alter table "public"."timesheets" add constraint "timesheets_holiday_date_id_fkey" FOREIGN KEY (holiday_date_id) REFERENCES holiday_dates(id) not valid;

alter table "public"."timesheets" validate constraint "timesheets_holiday_date_id_fkey";

grant delete on table "public"."holiday_dates" to "anon";

grant insert on table "public"."holiday_dates" to "anon";

grant references on table "public"."holiday_dates" to "anon";

grant select on table "public"."holiday_dates" to "anon";

grant trigger on table "public"."holiday_dates" to "anon";

grant truncate on table "public"."holiday_dates" to "anon";

grant update on table "public"."holiday_dates" to "anon";

grant delete on table "public"."holiday_dates" to "authenticated";

grant insert on table "public"."holiday_dates" to "authenticated";

grant references on table "public"."holiday_dates" to "authenticated";

grant select on table "public"."holiday_dates" to "authenticated";

grant trigger on table "public"."holiday_dates" to "authenticated";

grant truncate on table "public"."holiday_dates" to "authenticated";

grant update on table "public"."holiday_dates" to "authenticated";

grant delete on table "public"."holiday_dates" to "service_role";

grant insert on table "public"."holiday_dates" to "service_role";

grant references on table "public"."holiday_dates" to "service_role";

grant select on table "public"."holiday_dates" to "service_role";

grant trigger on table "public"."holiday_dates" to "service_role";

grant truncate on table "public"."holiday_dates" to "service_role";

grant update on table "public"."holiday_dates" to "service_role";

grant delete on table "public"."holidays" to "anon";

grant insert on table "public"."holidays" to "anon";

grant references on table "public"."holidays" to "anon";

grant select on table "public"."holidays" to "anon";

grant trigger on table "public"."holidays" to "anon";

grant truncate on table "public"."holidays" to "anon";

grant update on table "public"."holidays" to "anon";

grant delete on table "public"."holidays" to "authenticated";

grant insert on table "public"."holidays" to "authenticated";

grant references on table "public"."holidays" to "authenticated";

grant select on table "public"."holidays" to "authenticated";

grant trigger on table "public"."holidays" to "authenticated";

grant truncate on table "public"."holidays" to "authenticated";

grant update on table "public"."holidays" to "authenticated";

grant delete on table "public"."holidays" to "service_role";

grant insert on table "public"."holidays" to "service_role";

grant references on table "public"."holidays" to "service_role";

grant select on table "public"."holidays" to "service_role";

grant trigger on table "public"."holidays" to "service_role";

grant truncate on table "public"."holidays" to "service_role";

grant update on table "public"."holidays" to "service_role";

create policy "delete: timesheet_functions"
on "public"."holiday_dates"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "insert: timesheet_functions"
on "public"."holiday_dates"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "select: all authenticated users"
on "public"."holiday_dates"
as permissive
for select
to authenticated
using (true);


create policy "update: timesheet_functions"
on "public"."holiday_dates"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));


create policy "delete: timesheet_functions"
on "public"."holidays"
as permissive
for delete
to authenticated
using (has_permission('timesheet_functions'::text));


create policy "insert: timesheet_functions"
on "public"."holidays"
as permissive
for insert
to authenticated
with check (has_permission('timesheet_functions'::text));


create policy "select: all authenticated users"
on "public"."holidays"
as permissive
for select
to authenticated
using (true);


create policy "update: timesheet_functions"
on "public"."holidays"
as permissive
for update
to authenticated
using (has_permission('timesheet_functions'::text))
with check (has_permission('timesheet_functions'::text));



