import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Breadcrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  breadcrumbs: Breadcrumb[]
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
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="breadcrumb-item">
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-header-title">{title}</h1>
        {subtext && <p className="page-header-subtext">{subtext}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}
