export const employeeKeys = {
  all: ['employees'] as const,
  titles: (user_id: string) =>
    [...employeeKeys.all, 'titles', user_id] as const,
  active: () => [...employeeKeys.all, 'active'] as const,
  employee_id: (employee_id: string) =>
    [...employeeKeys.all, 'employee_id', employee_id] as const,
  user_id: (user_id: string) =>
    [...employeeKeys.all, 'user_id', user_id] as const,
  latest_title: (user_id: string) =>
    [...employeeKeys.user_id(user_id), 'latest_title'] as const,
};
