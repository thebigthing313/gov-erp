import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link, LinkProps } from '@tanstack/react-router'
import { CalendarDays, LayoutDashboard, TreePalm } from 'lucide-react'

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
    icon: <CalendarDays />,
    label: 'Pay Periods',
    linkProps: { to: '/timesheets/pay-periods' },
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
