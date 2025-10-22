import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HTMLAttributes, Ref } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group'

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
    <InputGroup className={className}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton variant="secondary" onClick={handleDecrement}>
          <ChevronLeft />
        </InputGroupButton>
      </InputGroupAddon>

      <InputGroupInput
        ref={ref}
        {...props}
        value={value}
        onChange={handleInputChange}
        type="text"
        className="text-center"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="secondary" onClick={handleIncrement}>
          <ChevronRight />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
