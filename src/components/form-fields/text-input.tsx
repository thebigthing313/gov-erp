import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Spinner } from '../ui/spinner'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  description?: string
  isLoading?: boolean
  errors?: Array<{ message?: string } | undefined>
  label?: string
}

export function TextInput({
  label,
  description,
  isLoading,
  errors,
  ...props
}: TextInputProps) {
  return (
    <Field data-invalid={!!errors?.length}>
      <FieldLabel>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <InputGroup>
        <InputGroupInput
          {...props}
          aria-invalid={!!errors?.length}
        ></InputGroupInput>
        {isLoading && (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        )}
      </InputGroup>

      {errors && errors.length > 0 && (
        <FieldError className="text-xs" errors={errors} />
      )}
    </Field>
  )
}
