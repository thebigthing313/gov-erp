import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import z from 'zod'

const ParamsSchema = z.object({
  year: z.coerce.number(),
  pp: z.coerce.number(),
})
export const Route = createFileRoute('/timesheets/pay-periods/$year/$pp')({
  component: RouteComponent,
  params: {
    parse: (raw) => ParamsSchema.parse(raw),
  },
  loader: ({ params }) => {
    return { crumb: `PP ${params.pp}` }
  },
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <ErrorBoundary fallback={<div>Error loading route.</div>}>
        <Suspense fallback={null}>
          <PPNavigation />
        </Suspense>
      </ErrorBoundary>
      <Outlet />
    </div>
  )
}

function PPNavigation() {
  const { year, pp: currentPP } = Route.useParams()
  const prevPP = currentPP - 1
  const nextPP = currentPP + 1

  return (
    <ButtonGroup>
      <ButtonGroupText className="w-28">Pay Period</ButtonGroupText>
      <Button asChild variant="outline" size="sm">
        <Link
          to="/timesheets/pay-periods/$year/$pp"
          params={{ year: year, pp: prevPP }}
        >
          <ChevronLeft />
        </Link>
      </Button>
      <ButtonGroupText className="flex bg-background w-24 justify-center">
        {currentPP}
      </ButtonGroupText>
      <Button asChild variant="outline" size="sm">
        <Link
          to="/timesheets/pay-periods/$year/$pp"
          params={{ year: year, pp: nextPP }}
        >
          <ChevronRight />
        </Link>
      </Button>
    </ButtonGroup>
  )
}
