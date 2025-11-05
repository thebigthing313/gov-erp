import { createFileRoute, Outlet } from '@tanstack/react-router'
import { GoToCurrentButtons } from '../-components/go-to-current-buttons'

export const Route = createFileRoute('/timesheets/pay-periods')({
  component: RouteComponent,
  loader: () => {
    return { crumb: 'Pay Periods' }
  },
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <GoToCurrentButtons />
      <Outlet />
    </div>
  )
}
