import { isMatch, Link, useMatches } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb'

export function SharedBreadcrumb() {
  const matches = useMatches()
  const matchesWithCrumbs = matches.filter((match) =>
    isMatch(match, 'loaderData.crumb'),
  )

  return (
    <Breadcrumb>
      <BreadcrumbList key={`breadcrumb-list`}>
        {matchesWithCrumbs.map((match, index) => (
          <div key={`${match.id}-wrapper`} className="flex gap-3 items-center">
            <BreadcrumbItem key={`${match.id}-item`}>
              <BreadcrumbLink key={`${match.id}-link`} asChild>
                <Link from={match.fullPath}>{match.loaderData?.crumb}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index + 1 < matchesWithCrumbs.length ? (
              <BreadcrumbSeparator key={`${match.id}-separator`} />
            ) : null}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
