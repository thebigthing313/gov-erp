import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const ParamsSchema = z.object({
  year: z.coerce.number(),
  pp: z.coerce.number(),
  date: z.string(),
})

export const Route = createFileRoute('/timesheets/pay-periods/$year/$pp/$date')(
  {
    params: {
      parse: (raw) => ParamsSchema.parse(raw),
    },
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/timesheets/pay-periods/$year/$pp/$date"!</div>
}
