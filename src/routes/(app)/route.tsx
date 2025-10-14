import { getAuth, isAuthenticated, Auth } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async ({ context }) => {
    const auth = await getAuth(context.supabase)

    if (!isAuthenticated(auth)) {
      throw redirect({ to: '/login' })
    }

    return { auth: auth as Auth }
  },
  component: RouteComponent,
  loader: async () => {},
})

function RouteComponent() {
  return (
    <div className="w-screen h-screen max-h-screen max-w-screen overflow-hidden flex items-center justify-center p-6">
      <Outlet />
    </div>
  )
}
