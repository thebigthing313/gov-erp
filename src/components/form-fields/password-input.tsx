import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react'
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Button } from '../ui/button'

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  description?: string
  isLoading?: boolean
  errors?: Array<{ message?: string } | undefined>
  label?: string
}

export function PasswordInput({
  label,
  description,
  errors,
  ...props
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <Field data-invalid={!!errors?.length}>
      <FieldLabel htmlFor="password">{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <InputGroup>
        <InputGroupInput
          id="password"
          type={isPasswordVisible ? 'text' : 'password'}
          {...props}
          aria-invalid={!!errors?.length}
        ></InputGroupInput>

        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <EyeOff /> : <EyeIcon />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      {errors && errors.length > 0 && (
        <FieldError className="text-xs" errors={errors} />
      )}
    </Field>
  )
}
