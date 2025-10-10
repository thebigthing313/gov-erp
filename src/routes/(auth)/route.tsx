import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
