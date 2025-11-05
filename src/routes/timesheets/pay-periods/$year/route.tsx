import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/timesheets/pay-periods/$year')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
