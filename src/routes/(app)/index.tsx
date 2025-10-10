import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Card className="min-w-md max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Hello, </CardTitle>
      </CardHeader>
    </Card>
  )
}
