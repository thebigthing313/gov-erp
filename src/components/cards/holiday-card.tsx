import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../ui/item'

interface HolidayCardProps {
  index: number
  title: string
  description: string
  className?: string
}
export function HolidayCard({
  index,
  title,
  description,
  className,
}: HolidayCardProps) {
  return (
    <Item variant="outline" size="sm" className={className}>
      <ItemMedia className="flex items-center">
        <div className="flex items-center justify-center bg-accent size-8 rounded-3xl border-2 font-semibold">
          {index}
        </div>
      </ItemMedia>
      <ItemContent className="gap-0">
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
