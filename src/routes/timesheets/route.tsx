import {
  SharedLayoutHeader,
  SharedLayoutOutlet,
  SharedLayoutSidebar,
} from '@/components/layout/shared-layout'
import { Typography } from '@/components/typography'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  employeesCollection,
  holidayDatesCollection,
  holidaysCollection,
  titlesCollection,
} from '@/db/collections'
import { getEmployeeTitlesCollection } from '@/db/factories/employee-titles'
import { getTimesheetsCollection } from '@/db/factories/timesheets'
import { Auth, getAuth, hasPermission, isAuthenticated } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { TimesheetsSidebarContent } from './-components/sidebar-contents'

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
  component: RouteComponent,
  loader: async ({ context }) => {
    await Promise.all([
      titlesCollection.preload(),
      employeesCollection.preload(),
      getEmployeeTitlesCollection(context.auth.employeeId).preload(),
      holidaysCollection.preload(),
      holidayDatesCollection.preload(),
      getTimesheetsCollection(new Date().getFullYear()).preload(),
    ])
  },
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
