import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatCurrency } from '../utils/formatters'

const defaultGoal = {
  title: '',
  targetAmount: '',
  currentAmount: '',
  targetDate: '',
  status: 'ACTIVE',
}

export default function SavingsPage() {
  const [goals, setGoals] = useState([])
  const [form, setForm] = useState(defaultGoal)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadGoals = async () => {
    setError('')
    try {
      const response = await api.get('/savings-goals')
      setGoals(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load savings goals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount),
      }
      if (editingId) {
        await api.put(`/savings-goals/${editingId}`, payload)
      } else {
        await api.post('/savings-goals', payload)
      }
      setEditingId(null)
      setForm(defaultGoal)
      await loadGoals()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the savings goal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (goal) => {
    setEditingId(goal.id)
    setForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate,
      status: goal.status,
    })
  }

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete the savings goal "${goal.title}"? This action cannot be undone.`)) return
    setError('')
    try {
      await api.delete(`/savings-goals/${goal.id}`)
      await loadGoals()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the savings goal. Please try again.')
    }
  }

  if (loading) return <div className="section-loading">Loading savings goals...</div>

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Future planning</p>
          <h1>Savings goals</h1>
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}

      <div className="two-column-layout">
        <form className="panel-card form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit goal' : 'New goal'}</h3>
          <div className="form-grid narrow">
            <label>
              Goal title
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Target amount
              <input type="number" min="1" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
            </label>
            <label>
              Current amount
              <input type="number" min="0" step="0.01" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} required />
            </label>
            <label>
              Target date
              <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} required />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update goal' : 'Create goal'}</button>
          {editingId && <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(defaultGoal) }}>Cancel edit</button>}
        </form>

        <div className="panel-card list-card">
          <h3>Goal progress</h3>
          {goals.map((goal) => (
            <div key={goal.id} className="goal-item">
              <div className="budget-row">
                <strong>{goal.title}</strong>
                <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${Math.min(Number(goal.progressPercentage || 0), 100)}%` }} />
              </div>
              <small>{Number(goal.progressPercentage || 0).toFixed(1)}% complete • Target {goal.targetDate}</small>
              <div className="header-actions">
                <button className="secondary-button" type="button" onClick={() => handleEdit(goal)}>Edit</button>
                <button className="secondary-button" type="button" onClick={() => handleDelete(goal)}>Delete</button>
              </div>
            </div>
          ))}
          {goals.length === 0 && <p>No savings goals yet. Add a goal to track your progress.</p>}
        </div>
      </div>
    </div>
  )
}
