import { getAuth, isAuthenticated } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async () => {
    const auth = await getAuth()
    if (isAuthenticated(auth) === true) throw redirect({ to: '/' })
  },
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
