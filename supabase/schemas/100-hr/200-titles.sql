create table public.titles (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    modified_at timestamp with time zone not null default now(),
    title_name text not null,
    is_clerical boolean not null default false,
    is_salaried boolean not null default false,
    minimum_annual_salary numeric(12,2),
    maximum_annual_salary numeric(12,2),
    title_description_url text,
    csc_code text not null,
    csc_description_url text,
    constraint unique_title unique(title_name),
    constraint unique_code unique(csc_code)
);



create function update_titles_modified_at()
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

create trigger updated_titles
    before update
    on public.titles
    for each row
    execute function update_titles_modified_at();
