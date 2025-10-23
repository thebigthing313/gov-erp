import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../ui/field'

interface GenericFieldProps {
  label?: string
  description?: string
  errors?: Array<{ message?: string } | undefined>
  isValid?: boolean
  children?: React.ReactNode
  className?: string
  orientation?: 'vertical' | 'horizontal' | 'responsive' | null
}

export function FormField({
  label,
  description,
  errors,
  isValid,
  children,
  className,
  orientation = 'vertical',
  ...props
}: GenericFieldProps) {
  const fieldLabel = label ? <FieldLabel>{label}</FieldLabel> : null
  const fieldDescription = description ? (
    <FieldDescription>{description}</FieldDescription>
  ) : null

  const unwrappedContent = (
    <>
      {fieldLabel}
      {fieldDescription}
    </>
  )
  return (
    <Field
      orientation={orientation}
      data-invalid={isValid}
      className={className}
      {...props}
    >
      {label && description ? (
        <FieldContent>{unwrappedContent}</FieldContent>
      ) : (
        unwrappedContent
      )}
      {children}
      <FieldError></FieldError>
    </Field>
  )
}
