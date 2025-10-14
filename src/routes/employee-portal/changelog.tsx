import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employee-portal/changelog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employee-portal/changelog"!</div>
}
