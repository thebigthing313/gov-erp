import { Typography } from '@/components/typography'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/timesheets/pay-periods')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-3xl flex flex-col gap-2">
      <Typography tag="h3">Pay Periods</Typography>
      <Outlet />
    </div>
  )
}
