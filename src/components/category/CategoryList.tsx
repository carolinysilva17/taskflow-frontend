import { useState } from 'react'
import type { Category } from '../../services/categoryService'
import { getErrorCode } from '../../utils/getErrorCode'
import Modal from '../shared/Modal'
import './CategoryList.css'

const CATEGORY_HAS_TASKS_MESSAGE = 'Essa categoria possui tarefas vinculadas e não pode ser excluída.'
const DELETE_ERROR_MESSAGE = 'Não foi possível excluir a categoria. Tente novamente.'

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type CategoryListProps = {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: number) => Promise<void>
}

function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleDeleteClick(category: Category) {
    setDeleteError(null)
    setPendingDelete(category)
  }

  function handleCancelDelete() {
    setPendingDelete(null)
    setDeleteError(null)
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await onDelete(pendingDelete.id)
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(getErrorCode(err) === 'CATEGORY_HAS_TASKS' ? CATEGORY_HAS_TASKS_MESSAGE : DELETE_ERROR_MESSAGE)
    } finally {
      setIsDeleting(false)
    }
  }

  if (categories.length === 0) {
    return <p className="category-list-empty">Nenhuma categoria cadastrada ainda.</p>
  }

  return (
    <>
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.id} className="category-list-item">
            <span className="category-list-band" style={{ backgroundColor: category.color }} />
            <div className="category-list-body">
              <span className="category-list-name">{category.name}</span>
              <div className="category-list-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label={`Editar ${category.name}`}
                  onClick={() => onEdit(category)}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon btn-icon-danger"
                  aria-label={`Excluir ${category.name}`}
                  onClick={() => handleDeleteClick(category)}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <Modal labelledBy="delete-category-title" onClose={handleCancelDelete}>
          <h2 id="delete-category-title">Excluir categoria</h2>
          <p>
            Tem certeza que deseja excluir <strong>{pendingDelete.name}</strong>? Essa ação não pode ser
            desfeita.
          </p>

          {deleteError && (
            <div className="banner-error" role="alert">
              <span>{deleteError}</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CategoryList
