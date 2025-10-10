import { cn } from '@/lib/utils'

interface TypographyProps {
  tag:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'p'
    | 'blockquote'
    | 'ul'
    | 'code'
    | 'lead'
    | 'lg'
    | 'muted'
    | 'sm'
    | 'xs'
  children?: React.ReactNode
  className?: string
}
export function Typography({ tag, children, className }: TypographyProps) {
  const h1Classes =
    'scroll-m-20 text-4xl font-extrabold tracking-tight text-balance'
  const h2Classes =
    'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0'
  const h3Classes = 'scroll-m-20 text-2xl font-semibold tracking-tight'
  const h4Classes = 'scroll-m-20 text-xl font-semibold tracking-tight'
  const pClasses = 'leading-7 [&:not(:first-child)]:mt-6 text-balance'
  const blockquoteClasses = 'mt-6 border-l-2 pl-6 italic'
  const ulClasses = 'my-6 ml-6 list-disc [&>li]:mt-2'
  const codeClasses =
    'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
  const leadClasses = 'text-muted-foreground text-xl'
  const lgClasses = 'text-lg font-semibold'
  const mutedClasses = 'text-muted-foreground text-sm'
  const smClasses = 'text-sm leading-none font-medium'

  switch (tag) {
    case 'h1':
      return <h1 className={cn(h1Classes, className)}>{children}</h1>
    case 'h2':
      return <h2 className={cn(h2Classes, className)}>{children}</h2>
    case 'h3':
      return <h3 className={cn(h3Classes, className)}>{children}</h3>
    case 'h4':
      return <h4 className={cn(h4Classes, className)}>{children}</h4>
    case 'p':
      return <p className={cn(pClasses, className)}>{children}</p>
    case 'blockquote':
      return (
        <blockquote className={cn(blockquoteClasses, className)}>
          {children}
        </blockquote>
      )
    case 'ul':
      return <ul className={cn(ulClasses, className)}>{children}</ul>
    case 'code':
      return <code className={cn(codeClasses, className)}>{children}</code>
    case 'lead':
      return <p className={cn(leadClasses, className)}>{children}</p>
    case 'lg':
      return <p className={cn(lgClasses, className)}>{children}</p>
    case 'muted':
      return <p className={cn(mutedClasses, className)}>{children}</p>
    case 'sm':
      return <p className={cn(smClasses, className)}>{children}</p>
  }
}
