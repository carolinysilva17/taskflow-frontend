import { describe, expect, it, vi } from 'vitest'
import { api } from './api'
import { createCategory, deleteCategory, listCategories, updateCategory } from './categoryService'

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('categoryService', () => {
  it('listCategories should GET /categories and return the data', async () => {
    const categories = [{ id: 1, name: 'Trabalho', color: '#4CAF50' }]
    vi.mocked(api.get).mockResolvedValue({ data: categories })

    const result = await listCategories()

    expect(api.get).toHaveBeenCalledWith('/categories')
    expect(result).toEqual(categories)
  })

  it('createCategory should POST /categories with the request body and return the data', async () => {
    const request = { name: 'Trabalho', color: '#4CAF50' }
    const created = { id: 1, ...request }
    vi.mocked(api.post).mockResolvedValue({ data: created })

    const result = await createCategory(request)

    expect(api.post).toHaveBeenCalledWith('/categories', request)
    expect(result).toEqual(created)
  })

  it('updateCategory should PUT /categories/:id with the request body and return the data', async () => {
    const request = { name: 'Estudos', color: '#2196F3' }
    const updated = { id: 1, ...request }
    vi.mocked(api.put).mockResolvedValue({ data: updated })

    const result = await updateCategory(1, request)

    expect(api.put).toHaveBeenCalledWith('/categories/1', request)
    expect(result).toEqual(updated)
  })

  it('deleteCategory should DELETE /categories/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({})

    await deleteCategory(1)

    expect(api.delete).toHaveBeenCalledWith('/categories/1')
  })
})
