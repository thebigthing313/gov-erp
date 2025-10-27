import { PrintLayoutHeader } from './print-header'

export function PrintLayout({
  children,
  ref,
}: React.ComponentPropsWithRef<'div'>) {
  return (
    <div className="flex flex-col gap-4 p-8" ref={ref}>
      <PrintLayoutHeader />
      {children}
    </div>
  )
}
