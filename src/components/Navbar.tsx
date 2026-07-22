import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const links = [
  { to: '/tasks', label: 'Tarefas' },
  { to: '/categories', label: 'Categorias' },
  { to: '/dashboard', label: 'Dashboard' },
]

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <nav className="navbar">
      <span className="brand-mark">TaskFlow</span>
      <ul className="navlinks">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="navuser">
        <span className="avatar">{initial}</span>
        <span>{user?.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  )
}

export default Navbar
