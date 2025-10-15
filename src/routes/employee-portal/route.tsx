import {
  SharedLayoutHeader,
  SharedLayoutOutlet,
  SharedLayoutSidebar,
} from '@/components/layout/shared-layout'
import { Typography } from '@/components/typography'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Auth, getAuth, isAuthenticated } from '@/lib/auth'
import {
  employeeInfoQueryOptions,
  employeeTitlesByUserIdQueryOptions,
} from '@/queries/employees/query-options'

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/employee-portal')({
  beforeLoad: async () => {
    const auth = await getAuth()

    if (!isAuthenticated(auth)) {
      throw redirect({ to: '/login' })
    }

    return { auth: auth as Auth }
  },
  component: RouteComponent,
  loader: async ({ context }) => {
    const { queryClient, auth } = context
    queryClient.ensureQueryData(employeeInfoQueryOptions(auth.userId))
    queryClient.ensureQueryData(employeeTitlesByUserIdQueryOptions(auth.userId))
  },
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <SharedLayoutSidebar user_id={auth.userId}>
        SIDEBARCONTENT
      </SharedLayoutSidebar>
      <SidebarInset>
        <SharedLayoutHeader>
          <Typography tag="h4">Employee Portal</Typography>
        </SharedLayoutHeader>
        <SharedLayoutOutlet>
          <Outlet />
        </SharedLayoutOutlet>
      </SidebarInset>
    </SidebarProvider>
  )
}
