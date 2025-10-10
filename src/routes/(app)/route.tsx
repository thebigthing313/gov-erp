import { getPermissions, getUserId, sessionExists } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async ({ context }) => {
    const activeSession = await sessionExists(context.supabase)
    if (!activeSession) throw redirect({ to: '/login' })
    const user_id = await getUserId(context.supabase)
    if (!user_id) throw redirect({ to: '/login' })
    const profile_id = await getUserId(context.supabase)
    if (!profile_id)
      throw new Error(
        'Your account was set up incorrectly. User has no linked profile.',
      )
    const permissions = await getPermissions(context.supabase)

    return { user_id, profile_id, permissions }
  },
  component: RouteComponent,
  loader: async () => {},
})

function RouteComponent() {
  return (
    <div className="w-screen h-screen flex items-center justify-center p-6">
      <Outlet />
    </div>
  )
}
