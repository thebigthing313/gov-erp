CREATE INDEX idx_timesheets_date_and_id ON public.timesheets USING btree (timesheet_date, id);


