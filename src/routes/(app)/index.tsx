import { Typography } from '@/components/typography'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { employeeInfoQueryOptions } from '@/queries/employees/query-options'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppCard } from '@/components/cards/app-card'
import { appList } from '@/data/company-app-list'
import { PendingComponent } from '@/components/pending-component'

export const Route = createFileRoute('/(app)/')({
  pendingComponent: PendingComponent,
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(
      employeeInfoQueryOptions(context.supabase, context.auth.userId),
    )
  },
})

function RouteComponent() {
  const { supabase, company, auth } = Route.useRouteContext()
  const { data } = useSuspenseQuery(
    employeeInfoQueryOptions(supabase, auth.userId),
  )
  const navigate = useNavigate()

  return (
    <Card className="min-w-sm max-w-xl not-visited:w-full max-h-full flex flex-col">
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
      <CardContent className="overflow-y-auto flex-1">
        {appList.map((app) => {
          if (
            !app.requiredPermission ||
            auth.permissions.includes(app.requiredPermission)
          ) {
            return (
              <AppCard
                variant="muted"
                key={app.name}
                title={app.name}
                description={app.description}
                icon={app.icon}
                version={app.version}
                changelogLink={app.changelogUrl}
                onOpen={() => navigate(app.appUrl)}
              />
            )
          }
        })}
      </CardContent>
      <CardFooter className="grid text-xs text-muted-foreground tracking-tight">
        <div>{company.name}</div>
        <div>{company.address}</div>
        <div>Phone: {company.phone}</div>
        <div>Fax: {company.fax}</div>
      </CardFooter>
    </Card>
  )
}
