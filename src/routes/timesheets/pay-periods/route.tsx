import { Typography } from '@/components/typography'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/timesheets/pay-periods')({
  component: RouteComponent,
  loader: () => {
    return { crumb: 'Pay Periods' }
  },
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <Outlet />
    </div>
  )
}
