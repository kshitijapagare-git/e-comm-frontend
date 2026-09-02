import { useEffect, useState } from 'react'
import { getCategories } from '../api/client'
import type { Category } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCategories()
      .then((result) => {
        if (cancelled) return
        setCategories(result)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load categories')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading, error }
}
