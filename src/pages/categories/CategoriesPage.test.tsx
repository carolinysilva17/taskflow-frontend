import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as categoryService from '../../services/categoryService'
import CategoriesPage from './CategoriesPage'

vi.mock('../../services/categoryService', async (importOriginal) => ({
  ...(await importOriginal()),
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

const TRABALHO = { id: 1, name: 'Trabalho', color: '#4CAF50' }

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.mocked(categoryService.listCategories).mockReset().mockResolvedValue([TRABALHO])
    vi.mocked(categoryService.createCategory).mockReset()
    vi.mocked(categoryService.updateCategory).mockReset()
    vi.mocked(categoryService.deleteCategory).mockReset()
  })

  it('shows a loading state and then the fetched categories', async () => {
    render(<CategoriesPage />)

    expect(screen.getByText('Carregando categorias...')).toBeInTheDocument()

    await screen.findByText('Trabalho')
  })

  it('shows an error banner when the initial fetch fails', async () => {
    vi.mocked(categoryService.listCategories).mockReset().mockRejectedValue(new Error('down'))

    render(<CategoriesPage />)

    await screen.findByText('Não foi possível carregar as categorias. Tente novamente em instantes.')
  })

  it('creates a category and refreshes the list', async () => {
    vi.mocked(categoryService.createCategory).mockResolvedValue({ id: 2, name: 'Estudos', color: '#2196F3' })
    render(<CategoriesPage />)
    await screen.findByText('Trabalho')

    vi.mocked(categoryService.listCategories).mockResolvedValue([TRABALHO, { id: 2, name: 'Estudos', color: '#2196F3' }])

    fireEvent.click(screen.getByRole('button', { name: 'Nova categoria' }))
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Estudos' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    await waitFor(() => expect(categoryService.createCategory).toHaveBeenCalledWith({ name: 'Estudos', color: '#2196F3' }))
    await screen.findByText('Estudos')
    expect(screen.queryByText('Nova categoria', { selector: 'h2' })).not.toBeInTheDocument()
  })

  it('edits a category pre-filled with its current data', async () => {
    vi.mocked(categoryService.updateCategory).mockResolvedValue({ id: 1, name: 'Trabalho Editado', color: '#4CAF50' })
    render(<CategoriesPage />)
    await screen.findByText('Trabalho')

    fireEvent.click(screen.getByRole('button', { name: 'Editar Trabalho' }))
    expect(screen.getByLabelText('Nome')).toHaveValue('Trabalho')

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Trabalho Editado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() =>
      expect(categoryService.updateCategory).toHaveBeenCalledWith(1, { name: 'Trabalho Editado', color: '#4CAF50' }),
    )
  })

  it('deletes a category after confirming', async () => {
    vi.mocked(categoryService.deleteCategory).mockResolvedValue(undefined)
    render(<CategoriesPage />)
    await screen.findByText('Trabalho')

    vi.mocked(categoryService.listCategories).mockResolvedValue([])

    fireEvent.click(screen.getByRole('button', { name: 'Excluir Trabalho' }))
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-danger')!)

    await waitFor(() => expect(categoryService.deleteCategory).toHaveBeenCalledWith(1))
    await screen.findByText('Nenhuma categoria cadastrada ainda.')
  })
})
