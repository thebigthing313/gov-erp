CREATE INDEX idx_timesheet_employees_composite ON public.timesheet_employees USING btree (timesheet_id, employee_id);


