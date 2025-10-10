import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'

interface SubmitButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children?: React.ReactNode
  isLoading?: boolean
}
export function SubmitButton({
  children,
  isLoading,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" variant="default" {...props}>
      {children}
      {isLoading && <Spinner />}
    </Button>
  )
}
