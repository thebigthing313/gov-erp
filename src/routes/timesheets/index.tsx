import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timesheets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/timesheets/"!</div>
}
