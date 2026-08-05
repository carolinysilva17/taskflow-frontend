import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

function renderModal(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <Modal labelledBy="modal-title" onClose={onClose}>
        <h2 id="modal-title">Title</h2>
        <button type="button">Inside button</button>
      </Modal>,
    ),
  }
}

describe('Modal', () => {
  it('closes when clicking the overlay', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('presentation'))

    expect(onClose).toHaveBeenCalled()
  })

  it('does not close when clicking inside the dialog', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('dialog'))
    fireEvent.click(screen.getByText('Inside button'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape', () => {
    const { onClose } = renderModal()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('focuses the first focusable element on mount', () => {
    renderModal()

    expect(screen.getByText('Inside button')).toHaveFocus()
  })
})
