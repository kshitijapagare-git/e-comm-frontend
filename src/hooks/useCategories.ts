import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '../api/client'
import type { Category } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    return getCategories()
      .then((result) => {
        setCategories(result)
        setError(null)
      })
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { categories, loading, error, reload }
}
