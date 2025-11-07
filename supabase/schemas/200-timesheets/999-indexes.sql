CREATE INDEX idx_timesheets_date_and_id
ON timesheets (timesheet_date, id);

CREATE INDEX idx_timesheet_employees_employee_id
ON timesheet_employees (employee_id);

CREATE INDEX idx_timesheet_employees_timesheet_id
ON timesheet_employees (timesheet_id);

CREATE INDEX idx_timesheet_employees_composite ON timesheet_employees (timesheet_id, employee_id);

CREATE INDEX idx_timesheet_employee_times_ts_employee_id
ON timesheet_employee_times (timesheet_employee_id);

CREATE INDEX idx_timesheet_employee_times_time_type_id
ON timesheet_employee_times (time_type_id);
