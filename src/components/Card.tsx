import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtext?: string
  children: ReactNode
  className?: string
}

export function Card({ title, subtext, children, className }: CardProps) {
  return (
    <section className={['card', className].filter(Boolean).join(' ')}>
      {(title || subtext) && (
        <header className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {subtext && <p className="card-subtext">{subtext}</p>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  )
}
