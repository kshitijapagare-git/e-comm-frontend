import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { AvatarTile } from './AvatarTile'
import { BellIcon, CartIcon, TagIcon, UsersIcon } from './icons'

const NAV_ITEMS = [
  { to: '/products', label: 'Products', Icon: TagIcon },
  { to: '/orders', label: 'Orders', Icon: CartIcon },
  { to: '/customers', label: 'Customers', Icon: UsersIcon },
]

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">
          Comm<span className="brand-accent">Admin</span>
        </span>
        <div className="topbar-actions">
          <span className="icon-btn" title="Notifications">
            <BellIcon />
          </span>
          <AvatarTile label="Admin User" shape="circle" />
        </div>
      </header>
      <div className="shell-body">
        <aside className="sidebar">
          <nav>
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className="sidebar-link" title={label} aria-label={label}>
                <Icon />
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
