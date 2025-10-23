import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group'

/**
 * Props for the PasswordInput component, extending standard input attributes with validation and styling options.
 */
interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Indicates if the input is valid; affects aria-invalid attribute. */
  isValid?: boolean
  /** Additional CSS classes for styling. */
  className?: string
}

/**
 * A password input component with a toggle button to show/hide the password text.
 * Uses an eye icon to indicate visibility state.
 * @param props - The component props.
 * @returns The rendered password input JSX element.
 */
export function PasswordInput({
  className,
  isValid,
  ...props
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <InputGroup className={className}>
      <InputGroupInput
        id="password"
        type={isPasswordVisible ? 'text' : 'password'}
        {...props}
        aria-invalid={!isValid}
      ></InputGroupInput>

      <InputGroupAddon align="inline-end">
        <InputGroupButton
          variant="ghost"
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          {isPasswordVisible ? <EyeOff /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
