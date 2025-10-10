import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
})

function RouteComponent() {
  const { company } = Route.useRouteContext()
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-sm">
        <Outlet />
        <div className="flex flex-col items-center text-xs text-muted-foreground tracking-tight">
          <span>{company.name}</span>
          <span>{company.address}</span>
        </div>
      </div>
    </div>
  )
}
