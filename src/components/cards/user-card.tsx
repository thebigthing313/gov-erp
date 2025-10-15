import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../ui/item'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface UserCardProps extends React.ComponentProps<typeof Item> {
  name: string
  title?: string
  avatarSrc?: string
}

export function UserCard({ name, avatarSrc, title, ...props }: UserCardProps) {
  return (
    <Item {...props}>
      <ItemMedia variant="image" className="size-12">
        <Avatar>
          <AvatarImage src={avatarSrc} alt={title} />
          <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
        <ItemDescription>{title}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
