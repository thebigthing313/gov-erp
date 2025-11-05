import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import z from 'zod'

const ParamsSchema = z.object({
  year: z.coerce.number(),
})
export const Route = createFileRoute('/timesheets/pay-periods/$year')({
  component: RouteComponent,
  params: { parse: (raw) => ParamsSchema.parse(raw) },
  loader: ({ params }) => {
    return { crumb: `${params.year}` }
  },
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <ErrorBoundary fallback={<div>Error loading route.</div>}>
        <Suspense fallback={null}>
          <YearsNavigation />
        </Suspense>
      </ErrorBoundary>
      <Outlet />
    </div>
  )
}

function YearsNavigation() {
  const { year: currentYear } = Route.useParams()
  const prevYear = currentYear - 1
  const nextYear = currentYear + 1

  return (
    <ButtonGroup>
      <ButtonGroupText className="w-28">Payroll Year</ButtonGroupText>
      <Button asChild variant="outline" size="sm">
        <Link to="/timesheets/pay-periods/$year" params={{ year: prevYear }}>
          <ChevronLeft />
        </Link>
      </Button>
      <ButtonGroupText className="flex bg-background w-24 justify-center">
        {currentYear}
      </ButtonGroupText>
      <Button asChild variant="outline" size="sm">
        <Link to="/timesheets/pay-periods/$year" params={{ year: nextYear }}>
          <ChevronRight />
        </Link>
      </Button>
    </ButtonGroup>
  )
}
