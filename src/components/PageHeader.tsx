import type { ReactNode } from 'react'

export interface Breadcrumb {
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
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {index > 0 && <span className="breadcrumb-separator"> &gt; </span>}
              <span className="breadcrumb-item">{crumb.label}</span>
            </span>
          ))}
        </nav>
        <h1 className="page-header-title">{title}</h1>
        {subtext && <p className="page-header-subtext">{subtext}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}
