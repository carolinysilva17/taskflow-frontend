import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axiosError } from '../../test-utils/axiosError'
import CategoryForm from './CategoryForm'

describe('CategoryForm', () => {
  it('shows "Nova categoria" and an empty name when creating', () => {
    render(<CategoryForm existingColors={[]} onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByText('Nova categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('')
  })

  it('defaults to the first color not already used by the user', () => {
    render(<CategoryForm existingColors={['#4CAF50', '#2196F3']} onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Cor')).toHaveValue('#ff9800')
  })

  it('shows "Editar categoria" pre-filled with the category data', () => {
    render(
      <CategoryForm
        category={{ id: 1, name: 'Trabalho', color: '#4CAF50' }}
        existingColors={['#4CAF50']}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('Editar categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Trabalho')
    expect(screen.getByLabelText('Cor')).toHaveValue('#4caf50')
  })

  it('shows a validation error and does not submit when the name is empty', () => {
    const onSubmit = vi.fn()
    render(<CategoryForm existingColors={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('trims the name and submits with the chosen color', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CategoryForm existingColors={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: '  Trabalho  ' } })
    fireEvent.change(screen.getByLabelText('Cor'), { target: { value: '#123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    await screen.findByRole('button', { name: 'Criar' })
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Trabalho', color: '#123456' })
  })

  it('shows a specific message when the name is duplicated', async () => {
    const onSubmit = vi.fn().mockRejectedValue(axiosError('CATEGORY_NAME_DUPLICATE'))
    render(<CategoryForm existingColors={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Trabalho' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    await screen.findByText('Já existe uma categoria com esse nome.')
  })

  it('clears the previous submit error when the name is cleared and resubmitted', async () => {
    const onSubmit = vi.fn().mockRejectedValue(axiosError('CATEGORY_NAME_DUPLICATE'))
    render(<CategoryForm existingColors={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Trabalho' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))
    await screen.findByText('Já existe uma categoria com esse nome.')

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    expect(screen.queryByText('Já existe uma categoria com esse nome.')).not.toBeInTheDocument()
  })

  it('shows a specific message when the color is duplicated', async () => {
    const onSubmit = vi.fn().mockRejectedValue(axiosError('CATEGORY_COLOR_DUPLICATE'))
    render(<CategoryForm existingColors={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Trabalho' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    await screen.findByText('Já existe uma categoria com essa cor.')
  })

  it('shows a generic message for unknown errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('network down'))
    render(<CategoryForm existingColors={[]} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Trabalho' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    await screen.findByText('Não foi possível salvar a categoria. Tente novamente.')
  })

  it('calls onCancel when Cancelar is clicked', () => {
    const onCancel = vi.fn()
    render(<CategoryForm existingColors={[]} onSubmit={vi.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onCancel on Escape', () => {
    const onCancel = vi.fn()
    render(<CategoryForm existingColors={[]} onSubmit={vi.fn()} onCancel={onCancel} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalled()
  })
})
