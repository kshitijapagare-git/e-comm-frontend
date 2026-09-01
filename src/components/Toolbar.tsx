import type { ChangeEvent, ReactNode } from 'react'
import { SearchIcon } from './icons'

interface ToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
}

export function Toolbar({ searchValue, onSearchChange, searchPlaceholder = 'Search…', children }: ToolbarProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onSearchChange(e.target.value)
  }

  return (
    <div className="toolbar">
      <div className="search-box">
        <SearchIcon />
        <input
          type="search"
          value={searchValue}
          onChange={handleChange}
          placeholder={searchPlaceholder}
          aria-label="Search"
        />
      </div>
      {children && <div className="toolbar-actions">{children}</div>}
    </div>
  )
}
