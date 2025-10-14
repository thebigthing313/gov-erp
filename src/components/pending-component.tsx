import { Card, CardContent } from './ui/card'
import { Spinner } from './ui/spinner'

export function PendingComponent() {
  return (
    <Card className="min-w-md max-w-lg mx-auto">
      <CardContent className="flex justify-center items-center gap-2">
        <span>Loading...</span>
        <Spinner />
      </CardContent>
    </Card>
  )
}
