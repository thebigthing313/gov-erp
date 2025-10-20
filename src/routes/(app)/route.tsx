import { PendingComponent } from '@/components/pending-component'
import { employeesCollection } from '@/db/collections'
import { getAuth, isAuthenticated, Auth } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async () => {
    const auth = await getAuth()

    if (!isAuthenticated(auth)) {
      throw redirect({ to: '/login' })
    }

    return { auth: auth as Auth }
  },
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: async () => {
    await employeesCollection.preload()
  },
})

function RouteComponent() {
  return (
    <div className="w-screen h-screen max-h-screen max-w-screen overflow-hidden flex items-center justify-center p-6">
      <Outlet />
    </div>
  )
}
