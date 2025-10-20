import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../ui/item'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useEmployee } from '@/db/hooks/use-employee'
import { useEmployeeTitles } from '@/db/hooks/use-employee-titles'

interface UserCardProps extends React.ComponentProps<typeof Item> {
  employee_id: string
  avatarSrc?: string
}

export function UserCard({ employee_id, ...props }: UserCardProps) {
  const { query: employeeQuery } = useEmployee(employee_id)
  const { query: employeeTitlesQuery } = useEmployeeTitles(employee_id)

  const employee = employeeQuery.data[0]
  const currentTitle = employeeTitlesQuery.data[0]

  return (
    <Item {...props}>
      <ItemMedia variant="image" className="size-12">
        <Avatar>
          <AvatarImage
            src={employee.photo_url ?? undefined}
            alt={employee.first_name}
          />
          <AvatarFallback>{employee?.first_name.charAt(0)}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {employee.first_name} {employee.last_name}
        </ItemTitle>
        <ItemDescription>{currentTitle.titles.title_name}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
