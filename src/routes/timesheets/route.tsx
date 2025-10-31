import {
  SharedLayoutHeader,
  SharedLayoutOutlet,
  SharedLayoutSidebar,
} from '@/components/shared-layout'
import { Typography } from '@/components/typography'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Auth, getAuth, hasPermission, isAuthenticated } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { TimesheetsSidebarContent } from './-components/sidebar-contents'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/timesheets')({
  beforeLoad: async () => {
    const auth = await getAuth()

    if (!isAuthenticated(auth)) {
      throw redirect({ to: '/login' })
    }

    if (!hasPermission(auth as Auth, 'timesheet_functions')) {
      throw new Error(
        'You are unauthorized to view this page. If you think this is an error, please contact your administrator.',
      )
    }

    return { auth: auth as Auth }
  },
  pendingComponent: () => <Spinner />,
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  return (
    <SidebarProvider>
      <SharedLayoutSidebar employee_id={auth.employeeId}>
        <TimesheetsSidebarContent />
      </SharedLayoutSidebar>
      <SidebarInset>
        <SharedLayoutHeader>
          <Typography tag="h4">Timesheet Program</Typography>
        </SharedLayoutHeader>
        <SharedLayoutOutlet>
          <Outlet />
        </SharedLayoutOutlet>
      </SidebarInset>
    </SidebarProvider>
  )
}
