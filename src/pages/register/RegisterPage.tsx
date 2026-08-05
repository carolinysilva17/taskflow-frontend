import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { getAuthErrorMessage } from '../../services/authService'

const GENERIC_ERROR_MESSAGE = 'Não foi possível criar sua conta agora. Tente novamente em instantes.'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register(name, email, password)
      navigate('/tasks', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err, GENERIC_ERROR_MESSAGE))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1>Criar conta</h1>
      <p className="sub">Leva menos de um minuto.</p>

      {error && (
        <div className="auth-banner-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="register-name">Nome</label>
          <input
            type="text"
            id="register-name"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            autoFocus
            required
          />
        </div>
        <div className="field">
          <label htmlFor="register-email">E-mail</label>
          <input
            type="email"
            id="register-email"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="register-password">Senha</label>
          <input
            type="password"
            id="register-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <div className="auth-switch">
        Já tem conta? <Link to="/login">Entrar</Link>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
