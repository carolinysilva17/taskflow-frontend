import { useState } from 'react'
import CategoryForm from '../../components/category/CategoryForm'
import CategoryList from '../../components/category/CategoryList'
import { useCategories } from '../../hooks/useCategories'
import type { Category, CategoryRequest } from '../../services/categoryService'
import './CategoriesPage.css'

function CategoriesPage() {
  const { categories, isLoading, error, create, update, remove } = useCategories()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  function handleCreateClick() {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  function handleEditClick(category: Category) {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  function handleFormCancel() {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  async function handleFormSubmit(request: CategoryRequest) {
    if (editingCategory) {
      await update(editingCategory.id, request)
    } else {
      await create(request)
    }

    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="categories-page">
      <div className="categories-panel">
        <div className="categories-header">
          <h1>Categorias</h1>
          <button type="button" className="btn btn-primary" onClick={handleCreateClick}>
            Nova categoria
          </button>
        </div>

        {error && (
          <div className="banner-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <p className="categories-loading">Carregando categorias...</p>
        ) : (
          <CategoryList categories={categories} onEdit={handleEditClick} onDelete={remove} />
        )}
      </div>

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          existingColors={categories.map((category) => category.color)}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

export default CategoriesPage
