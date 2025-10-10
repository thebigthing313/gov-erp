import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { employeeInfoQueryOptions } from '@/queries/employees/query-options'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      employeeInfoQueryOptions(context.supabase, context.user_id),
    )
  },
})

function RouteComponent() {
  const { supabase, user_id, company } = Route.useRouteContext()
  const { data } = useSuspenseQuery(employeeInfoQueryOptions(supabase, user_id))

  return (
    <Card className="min-w-md max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Hello, {data.first_name}</CardTitle>
      </CardHeader>
      <CardContent>list apps here</CardContent>
      <CardFooter className="grid gap-0">
        <div className="text-xs">{company.name}</div>
        <div className="text-xs">{company.address}</div>
        <div className="text-xs">{company.phone}</div>
        <div className="text-xs">{company.fax}</div>
      </CardFooter>
    </Card>
  )
}

function PendingComponent() {
  return (
    <Card className="min-w-md max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          <Skeleton />
        </CardTitle>
      </CardHeader>
      <CardFooter className="grid gap-0">
        <Skeleton />
        <Skeleton />
      </CardFooter>
    </Card>
  )
}
