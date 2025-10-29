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

interface SharedLayoutProps {
  children?: React.ReactNode
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <SidebarProvider className="max-h-svh">
      <SidebarInset className="h-screen">{children}</SidebarInset>
    </SidebarProvider>
  )
}

interface SharedLayoutHeaderProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  children?: React.ReactNode
}

export function SharedLayoutHeader({
  children,
  ...props
}: SharedLayoutHeaderProps) {
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

interface SharedLayoutInsetProps {
  children?: React.ReactNode
}
export function SharedLayoutInset({ children }: SharedLayoutInsetProps) {
  return (
    <SidebarInset className="flex flex-col h-full w-full">
      {children}
    </SidebarInset>
  )
}

interface SharedLayoutOutletProps {
  children?: React.ReactNode
}
export function SharedLayoutOutlet({ children }: SharedLayoutOutletProps) {
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
  const { employee_by_id } = useEmployee(employee_id)
  const { query: titlesQuery } = useEmployeeTitles(employee_id)

  const employee = employee_by_id.data[0]
  const currentTitle = titlesQuery.data[0]

  const navigate = useNavigate()
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
                  {currentTitle.titles.title_name}
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
