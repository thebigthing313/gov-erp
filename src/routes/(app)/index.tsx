import { Typography } from '@/components/typography'
import {
  Card,
  CardContent,
  CardDescription,
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
    <Card className="min-w-sm max-w-xl w-full">
      <CardHeader>
        <CardTitle>
          <Typography tag="h2">Welcome, {data.first_name}!</Typography>
        </CardTitle>
        <CardDescription>
          <Typography tag="muted">
            Here are your applications. If you think you are missing access to a
            specific app, let an admin know.
          </Typography>
        </CardDescription>
      </CardHeader>
      <CardContent>list apps here</CardContent>
      <CardFooter className="grid text-xs text-muted-foreground tracking-tight">
        <div>{company.name}</div>
        <div>{company.address}</div>
        <div>Phone: {company.phone}</div>
        <div>Fax: {company.fax}</div>
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
