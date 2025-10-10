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
import { sessionExists } from '@/lib/auth'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Terminal } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

const loginFormSchema = z.object({
  email: z.email('Invalid e-mail address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
})

export const Route = createFileRoute('/(auth)/login')({
  beforeLoad: async ({ context }) => {
    const isActiveSession = await sessionExists(context.supabase)
    if (isActiveSession) {
      throw redirect({
        to: '/',
      })
    }
  },
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
    validators: { onChange: loginFormSchema },
    onSubmit: async ({ value }) => {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: value.email,
        password: value.password,
      })

      if (loginError) throw setError(loginError.message)

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
              <div className="flex flex-col gap-6">
                <form.Field
                  name="email"
                  children={(field) => {
                    return (
                      <TextInput
                        label="E-mail"
                        type="email"
                        name={field.name}
                        placeholder="aedes@mosquito.com"
                        onChange={(e) => field.handleChange(e.target.value)}
                        errors={field.state.meta.errors}
                        required
                      />
                    )
                  }}
                />
                <form.Field
                  name="password"
                  children={(field) => {
                    return (
                      <PasswordInput
                        label="Password"
                        name={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        errors={field.state.meta.errors}
                        required
                      />
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
