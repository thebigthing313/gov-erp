import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../ui/field'

/**
 * Props for the FormField component, providing configuration for labels, descriptions, validation, and layout.
 */
interface GenericFieldProps {
  /** Optional label text for the field. */
  label?: string
  /** The HTML 'for' attribute value, typically matching the input's id. */
  htmlFor?: string
  /** Optional descriptive text below the label. */
  description?: string
  /** Array of error objects with optional message strings for validation feedback. */
  errors?: Array<{ message?: string } | undefined>
  /** Indicates if the field is valid; defaults to true. */
  isValid?: boolean
  /** Child components, typically form inputs. */
  children?: React.ReactNode
  /** Additional CSS classes for styling. */
  className?: string
  /** Layout orientation: vertical, horizontal, responsive, or null. */
  orientation?: 'vertical' | 'horizontal' | 'responsive' | null
}

/**
 * A generic form field component that wraps form inputs with optional label, description, and error display.
 * Handles layout orientation and validation state.
 * @param props - The component props.
 * @returns The rendered form field JSX element.
 */
export function FormField({
  label,
  htmlFor,
  description,
  errors,
  isValid = true,
  children,
  className,
  orientation = 'vertical',
  ...props
}: GenericFieldProps) {
  const fieldLabel = label ? (
    <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
  ) : null
  const fieldDescription = description ? (
    <FieldDescription>{description}</FieldDescription>
  ) : null

  // Combine label and description for conditional wrapping
  const unwrappedContent = (
    <>
      {fieldLabel}
      {fieldDescription}
    </>
  )
  return (
    <Field
      orientation={orientation}
      data-invalid={!isValid}
      className={className}
      {...props}
    >
      {label && description ? (
        <FieldContent>{unwrappedContent}</FieldContent>
      ) : (
        unwrappedContent
      )}
      {children}
      <FieldError className="text-xs tracking-tight" errors={errors} />
    </Field>
  )
}
