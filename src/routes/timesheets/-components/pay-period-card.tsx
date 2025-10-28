import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDate } from '@/lib/date-fns'
import { Edit, LucideFolderOpen } from 'lucide-react'

type PayPeriod = {
  id: string
  pay_period_number: number
  pay_date: Date
  start_date: Date
  end_date: Date
}
interface PayPeriodCardProps {
  pay_period?: PayPeriod
}

const DATE_FORMAT_OPTIONS = {
  weekday: 'long' as const,
  year: 'numeric' as const,
  month: 'long' as const,
  day: 'numeric' as const,
}
export function PayPeriodCard({
  pay_period,
  ...props
}: PayPeriodCardProps & React.ComponentPropsWithRef<'div'>) {
  if (!pay_period) return <PayPeriodCardSkeleton />

  return (
    <Item variant="outline" size="sm" {...props}>
      <ItemMedia className="font-semibold rounded-full" variant="icon">
        {pay_period.pay_period_number}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          Paid on: {formatDate(pay_period.pay_date, DATE_FORMAT_OPTIONS)}
        </ItemTitle>
        <ItemDescription className="flex flex-col">
          <span>
            Start: {formatDate(pay_period.start_date, DATE_FORMAT_OPTIONS)}
          </span>
          <span>
            End: {formatDate(pay_period.end_date, DATE_FORMAT_OPTIONS)}
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <ButtonGroup className="border rounded-2xl" orientation="vertical">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <LucideFolderOpen />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Timesheets</TooltipContent>
          </Tooltip>
          <ButtonGroupSeparator orientation="horizontal" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon">
                <Edit />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </ItemActions>
    </Item>
  )
}

function PayPeriodCardSkeleton() {
  return (
    <Item>
      <ItemMedia variant="icon">
        <Skeleton className="w-full h-full" />
      </ItemMedia>
      <ItemContent>
        <ItemDescription>
          <Skeleton className="w-5/8 h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-7/8 h-4" />
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
