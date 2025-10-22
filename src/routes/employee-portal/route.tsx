import {
  SharedLayoutHeader,
  SharedLayoutOutlet,
  SharedLayoutSidebar,
} from '@/components/shared-layout'
import { Typography } from '@/components/typography'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Auth, getAuth, isAuthenticated } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { EmployeePortalSidebarContent } from './-components/sidebar-content'
import { employeesCollection, titlesCollection } from '@/db/collections'
import { getEmployeeTitlesCollection } from '@/db/factories/employee-titles'

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
    const employeeTitlesCollection = getEmployeeTitlesCollection(
      context.auth.employeeId,
    )
    await employeesCollection.preload()
    await employeeTitlesCollection.preload()
    await titlesCollection.preload()
  },
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <SharedLayoutSidebar employee_id={auth.employeeId}>
        <EmployeePortalSidebarContent />
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
