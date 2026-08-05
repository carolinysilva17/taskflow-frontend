import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as categoryService from '../services/categoryService'
import { useCategories } from './useCategories'

vi.mock('../services/categoryService', async (importOriginal) => ({
  ...(await importOriginal()),
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

const TRABALHO = { id: 1, name: 'Trabalho', color: '#4CAF50' }

describe('useCategories', () => {
  beforeEach(() => {
    vi.mocked(categoryService.listCategories).mockReset().mockResolvedValue([TRABALHO])
    vi.mocked(categoryService.createCategory).mockReset()
    vi.mocked(categoryService.updateCategory).mockReset()
    vi.mocked(categoryService.deleteCategory).mockReset()
  })

  it('loads categories on mount', async () => {
    const { result } = renderHook(() => useCategories())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.categories).toEqual([TRABALHO])
    expect(result.current.error).toBeNull()
  })

  it('sets an error message when the initial fetch fails', async () => {
    vi.mocked(categoryService.listCategories).mockReset().mockRejectedValue(new Error('down'))

    const { result } = renderHook(() => useCategories())

    await waitFor(() => expect(result.current.error).not.toBeNull())
  })

  it('does not toggle isLoading again when refreshing after a mutation', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const created = { id: 2, name: 'Estudos', color: '#2196F3' }
    vi.mocked(categoryService.createCategory).mockResolvedValue(created)
    let resolveList: (categories: typeof TRABALHO[]) => void = () => {}
    vi.mocked(categoryService.listCategories).mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve
      }),
    )

    const createPromise = act(() => result.current.create({ name: 'Estudos', color: '#2196F3' }))

    expect(result.current.isLoading).toBe(false)

    resolveList([TRABALHO, created])
    await createPromise
  })

  it('create() saves the category and refreshes the list', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const created = { id: 2, name: 'Estudos', color: '#2196F3' }
    vi.mocked(categoryService.createCategory).mockResolvedValue(created)
    vi.mocked(categoryService.listCategories).mockResolvedValue([TRABALHO, created])

    await act(() => result.current.create({ name: 'Estudos', color: '#2196F3' }))

    expect(categoryService.createCategory).toHaveBeenCalledWith({ name: 'Estudos', color: '#2196F3' })
    expect(result.current.categories).toEqual([TRABALHO, created])
  })

  it('update() saves the category and refreshes the list', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const updated = { id: 1, name: 'Trabalho Editado', color: '#4CAF50' }
    vi.mocked(categoryService.updateCategory).mockResolvedValue(updated)
    vi.mocked(categoryService.listCategories).mockResolvedValue([updated])

    await act(() => result.current.update(1, { name: 'Trabalho Editado', color: '#4CAF50' }))

    expect(categoryService.updateCategory).toHaveBeenCalledWith(1, { name: 'Trabalho Editado', color: '#4CAF50' })
    expect(result.current.categories).toEqual([updated])
  })

  it('remove() deletes the category and refreshes the list', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(categoryService.deleteCategory).mockResolvedValue(undefined)
    vi.mocked(categoryService.listCategories).mockResolvedValue([])

    await act(() => result.current.remove(1))

    expect(categoryService.deleteCategory).toHaveBeenCalledWith(1)
    expect(result.current.categories).toEqual([])
  })

  it('propagates create errors without changing the list', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    vi.mocked(categoryService.createCategory).mockRejectedValue(new Error('conflict'))

    await expect(act(() => result.current.create({ name: 'Estudos', color: '#2196F3' }))).rejects.toThrow('conflict')
    expect(result.current.categories).toEqual([TRABALHO])
  })
})
