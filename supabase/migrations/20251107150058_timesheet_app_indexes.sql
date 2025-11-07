CREATE INDEX idx_timesheet_employee_times_time_type_id ON public.timesheet_employee_times USING btree (time_type_id);

CREATE INDEX idx_timesheet_employee_times_ts_employee_id ON public.timesheet_employee_times USING btree (timesheet_employee_id);

CREATE INDEX idx_timesheet_employees_employee_id ON public.timesheet_employees USING btree (employee_id);

CREATE INDEX idx_timesheet_employees_timesheet_id ON public.timesheet_employees USING btree (timesheet_id);


