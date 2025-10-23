import { CheckCircle, ClipboardCopy, X } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Spinner } from '../ui/spinner'
import { Button } from '../ui/button'

/**
 * Props for the TextInput component, extending standard input attributes with additional features for validation, loading, and actions.
 */
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Indicates if the input is valid; affects aria-invalid and shows check icon. */
  isValid?: boolean
  /** Shows a loading spinner if true. */
  isLoading?: boolean
  /** Enables paste button to insert clipboard content. */
  showPaste?: boolean
  /** Enables clear button to reset input value. */
  showClear?: boolean
  /** Additional CSS classes for styling. */
  className?: string
}

/**
 * A text input component with optional loading indicator, validation feedback, and action buttons for paste and clear.
 * Conditionally renders an addon with icons based on props.
 * @param props - The component props.
 * @returns The rendered text input JSX element.
 */
export function TextInput({
  className,
  isLoading,
  isValid = true,
  showPaste,
  showClear,
  onChange,
  ...props
}: TextInputProps) {
  // Determine if addon should be shown based on feature flags
  const includeAddon = (isLoading || isValid || showPaste || showClear) ?? false

  // Handles pasting clipboard content into the input
  const handlePasteClick = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      onChange?.({
        target: { value: clipboardText },
      } as React.ChangeEvent<HTMLInputElement>)
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  // Handles clearing the input value
  const handleClearClick = () => {
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <InputGroup className={className} {...props}>
      <InputGroupInput
        type="text"
        onChange={onChange}
        {...props}
        aria-invalid={!isValid}
      ></InputGroupInput>
      {includeAddon && (
        <InputGroupAddon align="inline-end">
          {isLoading && <Spinner />}
          {isValid && <CheckCircle color="green" />}
          {showClear && props.value && (
            <Button variant="ghost" size="icon" onClick={handleClearClick}>
              <X />
            </Button>
          )}
          {showPaste && (
            <Button variant="ghost" size="icon" onClick={handlePasteClick}>
              <ClipboardCopy />
            </Button>
          )}
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
