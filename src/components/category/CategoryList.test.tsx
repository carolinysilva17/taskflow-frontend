import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axiosError } from '../../test-utils/axiosError'
import CategoryList from './CategoryList'

const CATEGORIES = [
  { id: 1, name: 'Trabalho', color: '#4CAF50' },
  { id: 2, name: 'Pessoal', color: '#2196F3' },
]

describe('CategoryList', () => {
  it('shows the empty state when there are no categories', () => {
    render(<CategoryList categories={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Nenhuma categoria cadastrada ainda.')).toBeInTheDocument()
  })

  it('renders each category name', () => {
    render(<CategoryList categories={CATEGORIES} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Trabalho')).toBeInTheDocument()
    expect(screen.getByText('Pessoal')).toBeInTheDocument()
  })

  it('calls onEdit with the clicked category', () => {
    const onEdit = vi.fn()
    render(<CategoryList categories={CATEGORIES} onEdit={onEdit} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar Trabalho' }))

    expect(onEdit).toHaveBeenCalledWith(CATEGORIES[0])
  })

  it('asks for confirmation before deleting, and does nothing on cancel', () => {
    const onDelete = vi.fn()
    render(<CategoryList categories={CATEGORIES} onEdit={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir Trabalho' }))
    expect(screen.getByText('Excluir categoria')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByText('Excluir categoria')).not.toBeInTheDocument()
  })

  it('calls onDelete with the category id after confirming', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    render(<CategoryList categories={CATEGORIES} onEdit={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir Trabalho' }))
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-danger')!)

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1))
    await waitFor(() => expect(screen.queryByText('Excluir categoria')).not.toBeInTheDocument())
  })

  it('shows a specific message when the category has tasks linked', async () => {
    const onDelete = vi.fn().mockRejectedValue(axiosError('CATEGORY_HAS_TASKS'))
    render(<CategoryList categories={CATEGORIES} onEdit={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir Trabalho' }))
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-danger')!)

    await screen.findByText('Essa categoria possui tarefas vinculadas e não pode ser excluída.')
    expect(screen.getByText('Excluir categoria')).toBeInTheDocument()
  })

  it('shows a generic message for unknown delete errors', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('network down'))
    render(<CategoryList categories={CATEGORIES} onEdit={vi.fn()} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir Trabalho' }))
    fireEvent.click(screen.getByRole('dialog').querySelector('button.btn-danger')!)

    await screen.findByText('Não foi possível excluir a categoria. Tente novamente.')
  })

  it('closes the confirmation dialog on Escape', () => {
    render(<CategoryList categories={CATEGORIES} onEdit={vi.fn()} onDelete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Excluir Trabalho' }))
    expect(screen.getByText('Excluir categoria')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByText('Excluir categoria')).not.toBeInTheDocument()
  })
})
