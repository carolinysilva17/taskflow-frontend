import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type Category,
  type CategoryRequest,
} from '../services/categoryService'

const FETCH_ERROR_MESSAGE = 'Não foi possível carregar as categorias. Tente novamente em instantes.'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)
  const hasLoadedOnceRef = useRef(false)

  const refresh = useCallback(() => {
    if (!hasLoadedOnceRef.current) {
      setIsLoading(true)
    }
    setError(null)

    return listCategories()
      .then((data) => {
        if (isMountedRef.current) {
          setCategories(data)
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setError(FETCH_ERROR_MESSAGE)
        }
      })
      .finally(() => {
        hasLoadedOnceRef.current = true
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      })
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    refresh()

    return () => {
      isMountedRef.current = false
    }
  }, [refresh])

  async function create(request: CategoryRequest) {
    await createCategory(request)
    await refresh()
  }

  async function update(id: number, request: CategoryRequest) {
    await updateCategory(id, request)
    await refresh()
  }

  async function remove(id: number) {
    await deleteCategory(id)
    await refresh()
  }

  return { categories, isLoading, error, create, update, remove }
}
