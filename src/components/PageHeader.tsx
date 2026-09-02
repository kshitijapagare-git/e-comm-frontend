import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface PageHeaderBreadcrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  breadcrumbs: PageHeaderBreadcrumb[]
  title: string
  subtext?: string
  actions?: ReactNode
}

export function PageHeader({ breadcrumbs, title, subtext, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-main">
        {breadcrumbs.length > 0 && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <span key={`${crumb.label}-${index}`} className="breadcrumb-item">
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
                  )}
                  {!isLast && (
                    <span className="breadcrumb-separator" aria-hidden="true">
                      /
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        )}
        <h1>{title}</h1>
        {subtext && <p className="page-header-subtext">{subtext}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}
