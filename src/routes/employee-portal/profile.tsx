import { Typography } from '@/components/typography'
import { createFileRoute } from '@tanstack/react-router'
import { PersonalInfo } from './-components/profile/personal-info'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  employeeInfoQueryOptions,
  employeeTitlesByUserIdQueryOptions,
} from '@/queries/employees/query-options'
import { useQuery } from '@tanstack/react-query'
import { Title, TitlesTable } from './-components/profile/titles-table'

export const Route = createFileRoute('/employee-portal/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const { data } = useQuery(employeeInfoQueryOptions(auth.userId))
  const { data: titles } = useQuery(
    employeeTitlesByUserIdQueryOptions(auth.userId),
  )

  if (!titles || !data) return null

  const tableTitles = titles.map((title) => {
    const row: Title = {
      titleName: title.titles.title_name,
      titleCode: title.titles.csc_code,
      startDate: title.start_date,
      endDate: title.end_date,
      status: title.title_status,
      cscDescriptionUrl: title.titles.csc_description_url ?? undefined,
      isClerical: title.titles.is_clerical,
      isSalaried: title.titles.is_salaried,
    }
    return row
  })

  return (
    <div className="w-full flex flex-col gap-2 items-start">
      <Typography tag="h1">My Profile</Typography>
      <Typography tag="lead">
        The information in this page can only be modified by clerical staff. If
        you need to change anything, please submit an update request.
      </Typography>
      <PersonalInfo />
      <Card className="w-full shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Title History</CardTitle>
          <CardDescription>
            Civil Service Employee ID: {data.csc_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TitlesTable data={tableTitles} />
        </CardContent>
      </Card>
    </div>
  )
}
