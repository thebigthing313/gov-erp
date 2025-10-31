import { Separator } from '@/components/ui/separator'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Home, LogOutIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useNavigate } from '@tanstack/react-router'
import { signOut } from '@/lib/auth'
import { useEmployee } from '@/db/hooks/use-employee'
import { useEmployeeTitles } from '@/db/hooks/use-employee-titles'

export function SharedLayout({
  children,
}: React.ComponentPropsWithRef<typeof SidebarInset>) {
  return (
    <SidebarProvider className="max-h-svh">
      <SidebarInset className="h-screen">{children}</SidebarInset>
    </SidebarProvider>
  )
}

export function SharedLayoutHeader({
  children,
  ...props
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <>
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-100 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div {...props}>{children}</div>
        </div>
      </header>
      <Separator orientation="horizontal" decorative={true} />
    </>
  )
}

export function SharedLayoutOutlet({
  children,
}: React.ComponentPropsWithRef<'div'>) {
  return <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
}

interface SharedLayoutSidebarProps {
  employee_id: string
  children?: React.ReactNode
}

export function SharedLayoutSidebar({
  employee_id,
  children,
}: SharedLayoutSidebarProps) {
  const navigate = useNavigate()
  const {
    data: employee,
    isLoading: isLoadingEmployee,
    isError: isErrorEmployee,
  } = useEmployee(employee_id)
  const {
    data: employee_titles,
    isLoading: isLoadingEmployeeTitles,
    isError: isErrorEmployeeTitles,
  } = useEmployeeTitles(employee_id)
  if (isLoadingEmployee || isLoadingEmployeeTitles) return <div>Loading...</div>
  if (isErrorEmployee || isErrorEmployeeTitles || !employee || !employee_titles)
    return <div>Error loading employee data.</div>

  const currentTitle = employee_titles[0]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="My Profile"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar>
                <AvatarImage
                  src={employee.photo_url || undefined}
                  alt="Employee Avatar"
                />
                <AvatarFallback>{employee.first_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0">
                <span className="truncate font-medium">{`${employee.first_name} ${employee.last_name}`}</span>
                <span className="text-muted-foreground">
                  {currentTitle.title.title_name}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent> {children}</SidebarContent>

      <SidebarRail />
      <SidebarFooter>
        <Separator orientation="horizontal" decorative={true} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Home"
              onClick={() => navigate({ to: '/' })}
            >
              <Home />
              <span>My Apps</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => {
                signOut()
                navigate({ to: '/login' })
              }}
            >
              <LogOutIcon /> <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
