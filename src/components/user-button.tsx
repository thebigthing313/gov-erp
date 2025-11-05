import { useEmployee } from '@/db/hooks/use-employee'
import { useEmployeeTitles } from '@/db/hooks/use-employee-titles'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { AlertCircleIcon } from 'lucide-react'
import { Skeleton } from './ui/skeleton'

export function UserButton({
  ...props
}: React.ComponentPropsWithRef<typeof UserButtonBuilder>) {
  return (
    <ErrorBoundary fallback={<UserButtonError />}>
      <Suspense fallback={<UserButtonLoading />}>
        <UserButtonBuilder {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

interface UserButtonBuilderProps {
  employee_id: string
}
function UserButtonBuilder({ employee_id }: UserButtonBuilderProps) {
  const employee = useEmployee(employee_id)
  const { data: employee_titles } = useEmployeeTitles(employee_id)

  const currentTitle = employee_titles[0]

  return (
    <>
      <Avatar>
        <AvatarImage
          src={employee.photo_url || undefined}
          alt="Employee Avatar"
        />
        <AvatarFallback>{employee.first_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="grid gap-0">
        <span className="truncate font-medium">{`${employee.first_name} ${employee.last_name}`}</span>
        <span className="text-muted-foreground">
          {currentTitle.title.title_name}
        </span>
      </div>
    </>
  )
}

function UserButtonLoading() {
  return (
    <>
      <Avatar>
        <AvatarImage src={undefined} alt="Loading Avatar" />
        <AvatarFallback>
          <Skeleton className="size-full" />
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-0">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </>
  )
}

function UserButtonError() {
  return (
    <div className="text-destructive">
      <AlertCircleIcon /> Error loading user button.
    </div>
  )
}
