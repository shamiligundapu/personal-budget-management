import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/savings', label: 'Savings' },
  { to: '/reports', label: 'Reports' },
  { to: '/ai', label: 'AI Assistant' },
  { to: '/profile', label: 'Profile' },
  { to: '/admin', label: 'Admin' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">₹</div>
          <div>
            <h2>BudgetFlow</h2>
            <small>Smart money planner</small>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.filter((item) => item.to !== '/admin' || user?.role === 'ADMIN').map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-card">
          <strong>{user?.fullName || 'User'}</strong>
          <span>{user?.email || 'No email'}</span>
          <button type="button" className="secondary-button" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  )
}
