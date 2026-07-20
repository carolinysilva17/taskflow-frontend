import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/tasks', label: 'Tarefas' },
  { to: '/categories', label: 'Categorias' },
  { to: '/dashboard', label: 'Dashboard' },
]

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">TaskFlow</span>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
