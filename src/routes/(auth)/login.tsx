import { FormField } from '@/components/form-fields/form-field'
import { PasswordInput } from '@/components/form-fields/password-input'
import { SubmitButton } from '@/components/form-fields/submit-button'
import { TextInput } from '@/components/form-fields/text-input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EmailSchema, PasswordSchema } from '@/lib/form-field-schemas'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Terminal } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  validateSearch: loginSearchSchema,
})

function RouteComponent() {
  const { supabase } = Route.useRouteContext()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { redirect: redirectTo } = Route.useSearch()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: value.email,
        password: value.password,
      })

      if (loginError) setError(loginError.message)

      redirectTo ? navigate({ to: redirectTo }) : navigate({ to: '/' })
    },
  })

  return (
    <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {error && (
          <Alert variant="destructive">
            <Terminal />
            <AlertTitle>Login failed: {error}</AlertTitle>
            <AlertDescription></AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              <div className="flex flex-col gap-2">
                <form.Field
                  validators={{ onBlur: EmailSchema }}
                  name="email"
                  children={(field) => {
                    return (
                      <FormField
                        isValid={
                          field.state.meta.isTouched
                            ? field.state.meta.isValid
                            : undefined
                        }
                        htmlFor={field.name}
                        label="E-mail"
                        errors={field.state.meta.errors}
                      >
                        <TextInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          placeholder="aedes@mosquito.com"
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          isValid={field.state.meta.isValid}
                          required
                        />
                      </FormField>
                    )
                  }}
                />
                <form.Field
                  validators={{ onBlur: PasswordSchema }}
                  name="password"
                  children={(field) => {
                    return (
                      <FormField
                        label="Password"
                        htmlFor={field.name}
                        isValid={field.state.meta.isValid}
                        errors={field.state.meta.errors}
                      >
                        <PasswordInput
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          isValid={field.state.meta.isValid}
                          required
                        />
                      </FormField>
                    )
                  }}
                />
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <SubmitButton
                      disabled={!canSubmit || isSubmitting}
                      isLoading={isSubmitting}
                    >
                      Login
                    </SubmitButton>
                  )}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
