import { Typography } from '@/components/typography'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AppCard } from '@/components/cards/app-card'
import { appList } from '@/data/company-app-list'

import { hasPermission, signOut } from '@/lib/auth'
import { parsePhoneNumberWithError } from 'libphonenumber-js/min'
import { useEmployee } from '@/db/hooks/use-employee'

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { company, auth } = Route.useRouteContext()
  if (!auth.employeeId) return null

  const { query } = useEmployee(auth.employeeId)
  const employee = query.data[0]

  const navigate = useNavigate()
  const parsedPhone = parsePhoneNumberWithError(company.phone, {
    defaultCountry: 'US',
  })
  const parsedFax = parsePhoneNumberWithError(company.fax, {
    defaultCountry: 'US',
  })

  return (
    <Card className="min-w-sm max-w-xl not-visited:w-full max-h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          <Typography tag="h3">Welcome, {employee.first_name}!</Typography>
        </CardTitle>
        <CardDescription>
          <Typography tag="muted">
            Here are your applications. If you think you are missing access to a
            specific app, let an admin know.
          </Typography>
        </CardDescription>
        <CardAction>
          <Button
            variant="link"
            onClick={async () => {
              await signOut()
              navigate({ to: '/login' })
            }}
          >
            Logout
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {appList.map((app) => {
          if (
            !app.requiredPermission ||
            hasPermission(auth, app.requiredPermission)
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
        <div>Phone: {parsedPhone.formatNational()}</div>
        <div>Fax: {parsedFax.formatNational()}</div>
      </CardFooter>
    </Card>
  )
}
