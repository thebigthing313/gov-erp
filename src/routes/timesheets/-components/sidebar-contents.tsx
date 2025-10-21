import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link, LinkProps } from '@tanstack/react-router'
import { LayoutDashboard, TreePalm, User } from 'lucide-react'

type SidebarItem = {
  icon: React.ReactNode
  label: string
  linkProps: LinkProps
}
const sidebarItems: Array<SidebarItem> = [
  {
    icon: <LayoutDashboard />,
    label: 'Dashboard',
    linkProps: { to: '/timesheets' },
  },
  {
    icon: <TreePalm />,
    label: 'Holidays',
    linkProps: { to: '/timesheets/holidays' },
  },
]
export function TimesheetsSidebarContent() {
  return (
    <SidebarGroup>
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
