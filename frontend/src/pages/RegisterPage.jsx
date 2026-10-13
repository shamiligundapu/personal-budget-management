import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/register', form)
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>Start tracking your financial life in a few steps.</p>

        {error && <div className="error-box">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full name
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} type="text" placeholder="John Smith" required />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Minimum 8 characters" minLength={8} required />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
