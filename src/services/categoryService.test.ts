import { describe, expect, it, vi } from 'vitest'
import { axiosError } from '../test-utils/axiosError'
import { api } from './api'
import {
  CATEGORY_COLOR_PALETTE,
  createCategory,
  deleteCategory,
  getCategoryErrorMessage,
  listCategories,
  pickAvailableColor,
  updateCategory,
} from './categoryService'

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

describe('pickAvailableColor', () => {
  it('returns the first palette color not already used', () => {
    expect(pickAvailableColor([CATEGORY_COLOR_PALETTE[0]])).toBe(CATEGORY_COLOR_PALETTE[1])
  })

  it('falls back to the first color when the whole palette is used', () => {
    expect(pickAvailableColor(CATEGORY_COLOR_PALETTE)).toBe(CATEGORY_COLOR_PALETTE[0])
  })
})

describe('getCategoryErrorMessage', () => {
  it('maps CATEGORY_NAME_DUPLICATE to a specific message', () => {
    expect(getCategoryErrorMessage(axiosError('CATEGORY_NAME_DUPLICATE'), 'fallback')).toBe(
      'Já existe uma categoria com esse nome.',
    )
  })

  it('maps CATEGORY_COLOR_DUPLICATE to a specific message', () => {
    expect(getCategoryErrorMessage(axiosError('CATEGORY_COLOR_DUPLICATE'), 'fallback')).toBe(
      'Já existe uma categoria com essa cor.',
    )
  })

  it('maps CATEGORY_HAS_TASKS to a specific message', () => {
    expect(getCategoryErrorMessage(axiosError('CATEGORY_HAS_TASKS'), 'fallback')).toBe(
      'Essa categoria possui tarefas vinculadas e não pode ser excluída.',
    )
  })

  it('returns the fallback for unknown error codes', () => {
    expect(getCategoryErrorMessage(axiosError('SOMETHING_ELSE'), 'fallback')).toBe('fallback')
  })

  it('returns the fallback for non-axios errors', () => {
    expect(getCategoryErrorMessage(new Error('network down'), 'fallback')).toBe('fallback')
  })
})
