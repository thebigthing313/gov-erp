import { Trash } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../ui/item'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface HolidayCardProps {
  holiday_id: string
  index: number
  title: string
  description: string
  className?: string
  onDelete?: (holiday_id: string) => void
}
export function HolidayCard({
  index,
  holiday_id,
  title,
  description,
  onDelete,
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
      {onDelete && (
        <ItemActions>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => onDelete(holiday_id)}
              >
                <Trash />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </ItemActions>
      )}
    </Item>
  )
}
