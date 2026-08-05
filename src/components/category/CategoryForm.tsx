import { useState, type SubmitEvent } from 'react'
import { getCategoryErrorMessage, pickAvailableColor, type Category, type CategoryRequest } from '../../services/categoryService'
import Modal from '../shared/Modal'

const GENERIC_ERROR_MESSAGE = 'Não foi possível salvar a categoria. Tente novamente.'

type CategoryFormProps = {
  category?: Category | null
  existingColors: string[]
  onSubmit: (request: CategoryRequest) => Promise<void>
  onCancel: () => void
}

function CategoryForm({ category, existingColors, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color ?? pickAvailableColor(existingColors))
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = category != null

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    setNameError(null)
    setSubmitError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('Nome é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({ name: trimmedName, color })
    } catch (err) {
      setSubmitError(getCategoryErrorMessage(err, GENERIC_ERROR_MESSAGE))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal labelledBy="category-form-title" onClose={onCancel}>
      <h2 id="category-form-title">{isEditing ? 'Editar categoria' : 'Nova categoria'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="category-name">Nome</label>
          <input
            type="text"
            id="category-name"
            className={nameError ? 'invalid' : undefined}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          {nameError && <p className="field-error">{nameError}</p>}
        </div>

        <div className="field">
          <label htmlFor="category-color">Cor</label>
          <input
            type="color"
            id="category-color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        {submitError && (
          <div className="banner-error" role="alert">
            <span>{submitError}</span>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryForm
