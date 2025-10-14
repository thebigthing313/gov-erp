import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/timesheets/changelog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/timesheets/changelog"!</div>
}
