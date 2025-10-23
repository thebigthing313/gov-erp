import { useState } from 'react'
import { EyeIcon, EyeOff } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group'

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  isValid?: boolean
  className?: string
}

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
