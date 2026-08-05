import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { getAuthErrorMessage } from '../../services/authService'

const GENERIC_ERROR_MESSAGE = 'Não foi possível entrar agora. Tente novamente em instantes.'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/tasks', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err, GENERIC_ERROR_MESSAGE))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1>Entrar</h1>
      <p className="sub">Acesse suas tarefas.</p>

      {error && (
        <div className="auth-banner-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">E-mail</label>
          <input
            type="email"
            id="login-email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            required
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Senha</label>
          <input
            type="password"
            id="login-password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="auth-switch">
        Ainda não tem conta? <Link to="/register">Criar conta</Link>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
