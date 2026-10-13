import { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const updateProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.put('/auth/me', profile)
      updateUser(response.data)
      setSuccess('Profile updated.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update your profile.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/auth/me/password', password)
      setPassword({ currentPassword: '', newPassword: '' })
      setSuccess('Password changed.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not change your password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>User profile</h1>
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}
      {success && <div className="success-box" role="status">{success}</div>}

      <div className="two-column-layout">
        <form className="panel-card form-card" onSubmit={updateProfile}>
          <h3>Profile details</h3>
          <div className="form-grid">
            <label>
              Full name
              <input value={profile.fullName} maxLength="120" onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={profile.email} maxLength="120" onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
            </label>
          </div>
          <p><strong>Role:</strong> {user?.role}</p>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
        </form>

        <form className="panel-card form-card" onSubmit={changePassword}>
          <h3>Change password</h3>
          <div className="form-grid">
            <label>
              Current password
              <input type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} required />
            </label>
            <label>
              New password
              <input type="password" autoComplete="new-password" minLength="8" maxLength="128" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} required />
            </label>
          </div>
          <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Change password'}</button>
          <button type="button" className="secondary-button" onClick={logout}>Logout</button>
        </form>
      </div>
    </div>
  )
}
