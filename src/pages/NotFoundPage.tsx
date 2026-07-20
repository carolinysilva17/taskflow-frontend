import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div>
      <h1>404 — Página não encontrada</h1>
      <Link to="/">Voltar para o início</Link>
    </div>
  )
}

export default NotFoundPage
