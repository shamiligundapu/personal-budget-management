import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatCurrency } from '../utils/formatters'

const defaultBudget = {
  categoryId: '',
  monthlyLimit: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(defaultBudget)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const existingBudget = budgets.find((budget) => (
    budget.categoryId === Number(form.categoryId)
    && budget.month === Number(form.month)
    && budget.year === Number(form.year)
    && budget.id !== editingId
  ))

  const loadData = async () => {
    setError('')
    const [budgetResult, categoryResult] = await Promise.allSettled([
      api.get('/budgets'),
      api.get('/categories'),
    ])

    if (budgetResult.status === 'fulfilled') {
      setBudgets(budgetResult.value.data)
    }
    if (categoryResult.status === 'fulfilled') {
      setCategories(categoryResult.value.data)
    }
    if (budgetResult.status === 'rejected' || categoryResult.status === 'rejected') {
      setError(
        budgetResult.status === 'rejected'
          ? budgetResult.reason.response?.data?.message || 'Could not load budgets. Please try again.'
          : categoryResult.reason.response?.data?.message || 'Could not load categories. Please try again.',
      )
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        monthlyLimit: Number(form.monthlyLimit),
      }
      if (editingId) {
        await api.put(`/budgets/${editingId}`, payload)
      } else {
        await api.post('/budgets', payload)
      }
      setEditingId(null)
      setForm(defaultBudget)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the budget. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (budget) => {
    setEditingId(budget.id)
    setError('')
    setForm({
      categoryId: String(budget.categoryId),
      monthlyLimit: String(budget.monthlyLimit),
      month: budget.month,
      year: budget.year,
    })
  }

  const handleDelete = async (budget) => {
    if (!window.confirm(`Delete the ${budget.categoryName} budget for ${budget.month}/${budget.year}?`)) return
    setError('')
    try {
      await api.delete(`/budgets/${budget.id}`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the budget. Please try again.')
    }
  }

  const handleEditExistingBudget = () => {
    if (existingBudget) {
      handleEdit(existingBudget)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Spending guardrails</p>
          <h1>Budgets</h1>
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}

      <div className="two-column-layout">
        <form className="panel-card form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit budget' : 'Create budget'}</h3>
          <div className="form-grid narrow">
            <label>
              Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select category</option>
                {categories.filter((category) => category.type === 'EXPENSE').map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Monthly limit
              <input type="number" min="0" step="0.01" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} required />
            </label>
            <label>
              Month
              <input type="number" min="1" max="12" value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} required />
            </label>
            <label>
              Year
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
            </label>
          </div>
          {existingBudget && (
            <div className="budget-existing-notice" role="status">
              A budget already exists for this category and period. Edit it to change the limit.
              <button className="secondary-button" type="button" onClick={handleEditExistingBudget}>
                Edit existing budget
              </button>
            </div>
          )}
          <button className="primary-button" type="submit" disabled={saving || Boolean(existingBudget) || categories.every((category) => category.type !== 'EXPENSE')}>
            {saving ? 'Saving...' : editingId ? 'Update budget' : 'Save budget'}
          </button>
          {editingId && <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(defaultBudget) }}>Cancel edit</button>}
        </form>

        <div className="panel-card list-card">
          <h3>Current budget plan</h3>
          <p className="budget-help">Each budget counts all expense transactions in its category, across all months. Warnings appear at 80% and again when a budget is exceeded.</p>
          {budgets.map((budget) => {
            const utilization = Number(budget.utilizationPercentage || 0)
            const spent = Number(budget.totalSpent || 0)
            const limit = Number(budget.monthlyLimit || 0)
            const isExceeded = spent > limit
            const isAtLimit = spent > 0 && spent >= limit
            const isApproaching = utilization >= 80
            const status = isExceeded
              ? `Budget exceeded by ${formatCurrency(spent - limit)}.`
              : isAtLimit
                ? 'Budget limit reached. Further spending will exceed this budget.'
                : isApproaching
                  ? 'Spending alert: you have used at least 80% of this budget.'
                  : ''

            return (
              <div key={budget.id} className={`budget-item${isExceeded ? ' over-budget' : isApproaching ? ' near-budget' : ''}`}>
                <div className="budget-row">
                  <strong>{budget.categoryName}</strong>
                  <span>{formatCurrency(budget.monthlyLimit)}</span>
                </div>
                <small className="budget-period">
                  {new Date(budget.year, budget.month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </small>
                <div className="progress-track">
                  <span style={{ width: `${Math.min(utilization, 100)}%` }} />
                </div>
                <small>{utilization.toFixed(1)}% used • {formatCurrency(budget.totalSpent)} spent</small>
                {status && (
                  <p className={`budget-status${isExceeded ? ' over-budget' : isApproaching ? ' near-budget' : ''}`} role={isExceeded ? 'alert' : 'status'}>
                    {status}
                  </p>
                )}
                {spent === 0 && (
                  <small className="budget-zero-hint">No expenses recorded for this category.</small>
                )}
                <div className="header-actions">
                  <button className="secondary-button" type="button" onClick={() => handleEdit(budget)}>Edit</button>
                  <button className="secondary-button" type="button" onClick={() => handleDelete(budget)}>Delete</button>
                </div>
              </div>
            )
          })}
          {budgets.length === 0 && <p>No budgets yet. Create one to track monthly spending.</p>}
        </div>
      </div>
    </div>
  )
}
