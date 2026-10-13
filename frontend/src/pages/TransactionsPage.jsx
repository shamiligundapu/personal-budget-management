import { useEffect, useState } from 'react'
import api from '../api/axios'
import { formatCurrency } from '../utils/formatters'

const today = new Date().toISOString().slice(0, 10)
const defaultForm = {
  categoryId: '',
  type: 'EXPENSE',
  amount: '',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'UPI',
}
const defaultFilters = {
  type: '',
  categoryId: '',
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  to: today,
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [filters, setFilters] = useState(defaultFilters)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    setError('')
    const [txnResult, categoryResult] = await Promise.allSettled([
      api.get('/transactions', { params: filters }),
      api.get('/categories'),
    ])

    if (txnResult.status === 'fulfilled') {
      setTransactions(txnResult.value.data)
    }
    if (categoryResult.status === 'fulfilled') {
      setCategories(categoryResult.value.data)
    }
    if (txnResult.status === 'rejected' || categoryResult.status === 'rejected') {
      setError(
        txnResult.status === 'rejected'
          ? txnResult.reason.response?.data?.message || 'Could not load transactions. Please try again.'
          : categoryResult.reason.response?.data?.message || 'Could not load categories. Please try again.',
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
      }
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload)
      } else {
        await api.post('/transactions', payload)
      }
      setEditingId(null)
      setForm(defaultForm)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the transaction. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingId(transaction.id)
    setForm({
      categoryId: String(transaction.categoryId),
      type: transaction.type,
      amount: String(transaction.amount),
      description: transaction.description || '',
      transactionDate: transaction.transactionDate,
      paymentMethod: transaction.paymentMethod || '',
    })
  }

  const handleDelete = async (transaction) => {
    if (!window.confirm('Delete this transaction? This action cannot be undone.')) return
    setError('')
    try {
      await api.delete(`/transactions/${transaction.id}`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the transaction. Please try again.')
    }
  }

  if (loading) {
    return <div className="section-loading">Loading transactions...</div>
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Money movement</p>
          <h1>Transactions</h1>
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}

      <div className="two-column-layout">
        <form className="panel-card form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit transaction' : 'Add transaction'}</h3>
          <div className="form-grid narrow">
            <label>
              Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select category</option>
                {categories.filter((category) => category.type === form.type).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </label>
            <label>
              Amount
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </label>
            <label>
              Date
              <input type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} required />
            </label>
            <label>
              Payment method
              <input type="text" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} />
            </label>
            <label>
              Description
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={saving || categories.filter((category) => category.type === form.type).length === 0}>
            {saving ? 'Saving...' : editingId ? 'Update transaction' : 'Save transaction'}
          </button>
          {editingId && <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(defaultForm) }}>Cancel edit</button>}
        </form>

        <div className="panel-card table-card">
          <h3>Recent entries</h3>
          <div className="form-grid narrow">
            <label>
              Filter type
              <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, categoryId: '' })}>
                <option value="">All types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </label>
            <label>
              Filter category
              <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
                <option value="">All categories</option>
                {categories.filter((category) => !filters.type || category.type === filters.type).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              From
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </label>
            <label>
              To
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </label>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="5">No transactions found for this date range.</td></tr>
              ) : transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.categoryName}</td>
                  <td>{transaction.type}</td>
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td>{transaction.transactionDate}</td>
                  <td>
                    <button className="secondary-button" type="button" onClick={() => handleEdit(transaction)}>Edit</button>
                    <button className="secondary-button" type="button" onClick={() => handleDelete(transaction)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
