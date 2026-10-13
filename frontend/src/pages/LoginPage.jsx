import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', form)
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to continue managing your budget.</p>

        {error && <div className="error-box">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="••••••••" required />
          </label>
          <button className="primary-button" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Login'}</button>
        </form>

        <p className="auth-link">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  )
}
