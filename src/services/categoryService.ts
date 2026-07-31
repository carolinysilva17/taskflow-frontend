import { api } from './api'

export type Category = {
  id: number
  name: string
  color: string
}

export type CategoryRequest = {
  name: string
  color: string
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
