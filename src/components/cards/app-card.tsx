import { LinkProps, Link } from '@tanstack/react-router'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../ui/item'
import { Button } from '../ui/button'

interface AppCardProps extends React.ComponentProps<typeof Item> {
  title: string
  description: string
  icon: React.ReactNode
  version?: string
  changelogLink?: LinkProps
  onOpen?: () => void
}

export function AppCard({
  title,
  description,
  version,
  icon,
  changelogLink,
  onOpen,
  ...props
}: AppCardProps) {
  return (
    <Item {...props}>
      <ItemMedia variant="icon" className="size-12">
        {icon}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {title}{' '}
          <span className="font-normal text-xs text-muted-foreground">
            {version && changelogLink && (
              <Link {...changelogLink}>v{version}</Link>
            )}
            {version && !changelogLink && <div>v{version}</div>}
          </span>
        </ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button type="button" variant="outline" onClick={onOpen}>
          Open
        </Button>
      </ItemActions>
    </Item>
  )
}
