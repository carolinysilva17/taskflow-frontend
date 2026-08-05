import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext, type AuthContextValue } from '../../contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'

function renderProtectedRoute(contextValue: AuthContextValue) {
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/tasks" element={<p>Tasks page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const noop = async () => {}

describe('ProtectedRoute', () => {
  it('renders nothing while the session is still loading', () => {
    const { container } = renderProtectedRoute({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: noop,
      register: noop,
      logout: noop,
    })

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
    expect(screen.queryByText('Tasks page')).not.toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderProtectedRoute({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: noop,
      register: noop,
      logout: noop,
    })

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the nested route when authenticated', () => {
    renderProtectedRoute({
      user: { id: 1, name: 'Carol', email: 'carol@test.com' },
      isAuthenticated: true,
      isLoading: false,
      login: noop,
      register: noop,
      logout: noop,
    })

    expect(screen.getByText('Tasks page')).toBeInTheDocument()
  })
})
