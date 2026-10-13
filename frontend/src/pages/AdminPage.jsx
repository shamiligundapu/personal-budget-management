import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/admin/users')
        setUsers(response.data)
      } catch (err) {
        setError('You do not have admin access or the backend is not available.')
      }
    }

    loadUsers()
  }, [])

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Admin center</h1>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-card table-card">
        <h3>Registered users</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((member) => (
              <tr key={member.id}>
                <td>{member.fullName}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
