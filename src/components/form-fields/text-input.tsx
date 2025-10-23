import { CheckCircle, ClipboardCopy, X } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Spinner } from '../ui/spinner'
import { Button } from '../ui/button'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean
  isLoading?: boolean
  showPaste?: boolean
  showClear?: boolean
  className?: string
}

export function TextInput({
  className,
  isLoading,
  isValid = true,
  showPaste,
  showClear,
  onChange,
  ...props
}: TextInputProps) {
  const includeAddon = (isLoading || isValid || showPaste || showClear) ?? false

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
