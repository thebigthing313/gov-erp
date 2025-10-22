import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'
import type { QueryClient } from '@tanstack/react-query'
import type { MCMECSupabaseClient } from '@/db/client'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/typography'
import type { Company } from '@/data/company-data'
import { PendingComponent } from '@/components/pending-component'
import { Toaster } from '@/components/ui/sonner'

interface MyRouterContext {
  queryClient: QueryClient
  supabase: MCMECSupabaseClient
  company: Company
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  pendingComponent: PendingComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent,
  component: () => (
    <div className="h-screen">
      <Outlet />
      <Toaster />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </div>
  ),
})

function NotFoundComponent() {
  return (
    <section className="relative z-10 bg-primary py-[120px]">
      <div className="container mx-auto">
        <div className="-mx-4 flex">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[400px] text-center">
              <Typography tag="h2">404</Typography>
              <Typography tag="h4">Oops! That page can't be found</Typography>
              <Typography tag="p">
                The page you are looking for it maybe deleted
              </Typography>
              <Button variant="link" asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RootErrorComponent({ error }: { error: Error }) {
  const errorMessage = error.message
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-xl w-full p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-2xl border border-destructive/50">
        {/* Header and Title */}
        <div className="flex items-center space-x-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-destructive">
            Application Error
          </h1>
        </div>
        <hr className="border-border" />

        {/* User-friendly message */}
        <p className="text-muted-foreground">
          We're sorry, but an unexpected error occurred while loading the page.
          The issue has been logged.
        </p>

        {/* Development Details Section (Conditional) */}
        {isDevelopment && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Debugging Information
            </h2>

            <div className="p-4 rounded-md border border-destructive/80 bg-destructive/10">
              <span className="font-bold block mb-1">Error Message:</span>
              <p className="font-mono text-sm text-destructive-foreground">
                {errorMessage}
              </p>
            </div>

            {error.stack && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer font-medium text-primary hover:text-primary/80 transition-colors">
                  View Stack Trace
                </summary>
                <pre className="mt-2 p-3 bg-secondary rounded-md overflow-auto text-xs text-secondary-foreground whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mt-8">
          <Button variant="link" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
              <span>Go to Homepage</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
