import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link, LinkProps } from '@tanstack/react-router'
import { LayoutDashboard, User } from 'lucide-react'

type SidebarItem = {
  icon: React.ReactNode
  label: string
  linkProps: LinkProps
}
const sidebarItems: Array<SidebarItem> = [
  {
    icon: <LayoutDashboard />,
    label: 'Dashboard',
    linkProps: { to: '/employee-portal' },
  },
  {
    icon: <User />,
    label: 'Profile',
    linkProps: { to: '/employee-portal/profile' },
  },
]
export function EmployeePortalSidebarContent() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={`sidebar-menu-item-${item.label}`}>
              <Link {...item.linkProps}>
                <SidebarMenuButton tooltip={item.label}>
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
