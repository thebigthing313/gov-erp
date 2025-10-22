import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ButtonGroup } from './ui/button-group'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { HTMLAttributes, Ref } from 'react'

interface YearSelectorProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  className?: string
  onChange: (year: number) => void
  ref?: Ref<HTMLInputElement>
}

export function YearSelector({
  value,
  onChange,
  ref,
  className,
  ...props
}: YearSelectorProps) {
  const handleDecrement = () => {
    onChange(value - 1)
  }

  const handleIncrement = () => {
    onChange(value + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <ButtonGroup className={className}>
      <Button onClick={handleDecrement}>
        <ChevronLeft />
      </Button>
      <Input
        ref={ref}
        {...props}
        value={value}
        onChange={handleInputChange}
        type="text"
        className="text-center"
      />
      <Button onClick={handleIncrement}>
        <ChevronRight />
      </Button>
    </ButtonGroup>
  )
}
