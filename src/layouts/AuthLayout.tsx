import type { ReactNode } from 'react'
import './AuthLayout.css'

interface AuthLayoutProps {
  children: ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-view">
      <aside className="auth-panel">
        <div className="auth-panel-top">
          <div className="brand-mark auth-brand">TaskFlow</div>
          <p className="auth-tagline">Organize suas tarefas, sem complicação.</p>
        </div>
        <p className="auth-panel-bottom">Categorias, prioridades e status num só lugar.</p>
      </aside>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="brand-mark brand-mark-mobile">TaskFlow</div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
