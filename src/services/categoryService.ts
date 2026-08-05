import { api } from './api'
import { createErrorMessageResolver } from '../utils/createErrorMessageResolver'

export type Category = {
  id: number
  name: string
  color: string
}

export type CategoryRequest = {
  name: string
  color: string
}

export type CategoryErrorCode = 'CATEGORY_NAME_DUPLICATE' | 'CATEGORY_COLOR_DUPLICATE' | 'CATEGORY_HAS_TASKS'

const CATEGORY_ERROR_MESSAGES: Record<CategoryErrorCode, string> = {
  CATEGORY_NAME_DUPLICATE: 'Já existe uma categoria com esse nome.',
  CATEGORY_COLOR_DUPLICATE: 'Já existe uma categoria com essa cor.',
  CATEGORY_HAS_TASKS: 'Essa categoria possui tarefas vinculadas e não pode ser excluída.',
}

export const getCategoryErrorMessage = createErrorMessageResolver(CATEGORY_ERROR_MESSAGES)

export const CATEGORY_COLOR_PALETTE = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#009688',
  '#3F51B5',
  '#795548',
]

export function pickAvailableColor(usedColors: string[]): string {
  return CATEGORY_COLOR_PALETTE.find((color) => !usedColors.includes(color)) ?? CATEGORY_COLOR_PALETTE[0]
}

export async function listCategories() {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function createCategory(request: CategoryRequest) {
  const { data } = await api.post<Category>('/categories', request)
  return data
}

export async function updateCategory(id: number, request: CategoryRequest) {
  const { data } = await api.put<Category>(`/categories/${id}`, request)
  return data
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`)
}
