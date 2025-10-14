import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employee-portal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employee-portal"!</div>
}
