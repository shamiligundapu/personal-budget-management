import { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import api from '../api/axios'
import { formatCurrency } from '../utils/formatters'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [monthly, setMonthly] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = async () => {
    setLoading(true)
    setError('')
    const [monthlyResult, categoryResult] = await Promise.allSettled([
      api.get('/reports/monthly', { params: { year } }),
      api.get('/reports/categories', { params: { month, year } }),
    ])
    if (monthlyResult.status === 'fulfilled') {
      setMonthly(monthlyResult.value.data)
    }
    if (categoryResult.status === 'fulfilled') {
      setCategories(categoryResult.value.data)
    }
    if (monthlyResult.status === 'rejected' || categoryResult.status === 'rejected') {
      setError(
        monthlyResult.status === 'rejected'
          ? monthlyResult.reason.response?.data?.message || 'Could not load monthly reports.'
          : categoryResult.reason.response?.data?.message || 'Could not load category reports.',
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [])

  const monthlyChart = useMemo(() => ({
    labels: monthly.map((item) => item.month.slice(0, 3)),
    datasets: [
      { label: 'Income', data: monthly.map((item) => Number(item.income || 0)), backgroundColor: '#2563eb' },
      { label: 'Expense', data: monthly.map((item) => Number(item.expense || 0)), backgroundColor: '#7c3aed' },
    ],
  }), [monthly])

  const categoryChart = useMemo(() => ({
    labels: categories.map((item) => item.categoryName),
    datasets: [{ data: categories.map((item) => Number(item.totalAmount || 0)), backgroundColor: ['#14b8a6', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'] }],
  }), [categories])

  const exportCsv = () => {
    const rows = [
      ['Monthly cash flow', 'Income', 'Expenses', 'Net'],
      ...monthly.map((item) => [item.month, item.income, item.expense, item.balance]),
      [],
      [`Category spending (${month}/${year})`, 'Total'],
      ...categories.map((item) => [item.categoryName, item.totalAmount]),
    ]
    const csv = rows.map((row) => row.map((value) => {
      const text = String(value ?? '')
      return `"${text.replaceAll('"', '""')}"`
    }).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `budgetflow-report-${year}-${String(month).padStart(2, '0')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const totalIncome = monthly.reduce((sum, item) => sum + Number(item.income || 0), 0)
  const totalExpenses = monthly.reduce((sum, item) => sum + Number(item.expense || 0), 0)

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h1>Reports & analytics</h1>
        </div>
        <button className="secondary-button" type="button" onClick={exportCsv} disabled={!monthly.length && !categories.length}>Export CSV</button>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}

      <div className="panel-card form-grid narrow">
        <label>
          Category report month
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>{new Date(2000, index).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
        </label>
        <label>
          Report year
          <input type="number" min="2000" max="9999" value={year} onChange={(event) => setYear(Number(event.target.value))} />
        </label>
        <button className="primary-button" type="button" onClick={loadReports} disabled={loading}>
          {loading ? 'Loading...' : 'Apply filters'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>Year income</span><strong>{formatCurrency(totalIncome)}</strong></div>
        <div className="stat-card"><span>Year expenses</span><strong>{formatCurrency(totalExpenses)}</strong></div>
        <div className="stat-card"><span>Net cash flow</span><strong>{formatCurrency(totalIncome - totalExpenses)}</strong></div>
      </div>

      {loading ? <div className="section-loading">Loading reports...</div> : (
        <>
          <div className="chart-grid">
            <div className="panel-card chart-card">
              <h3>Monthly totals for {year}</h3>
              {monthly.some((item) => Number(item.income) || Number(item.expense))
                ? <Bar data={monthlyChart} options={{ responsive: true, maintainAspectRatio: false }} />
                : <p>No income or expenses recorded for this year.</p>}
            </div>

            <div className="panel-card chart-card">
              <h3>Expense categories for {month}/{year}</h3>
              {categories.length
                ? <Doughnut data={categoryChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                : <p>No category expenses recorded for this month.</p>}
            </div>
          </div>

          <div className="panel-card table-card">
            <h3>Category breakdown</h3>
            <table>
              <thead><tr><th>Category</th><th>Total expenses</th></tr></thead>
              <tbody>
                {categories.length ? categories.map((item) => (
                  <tr key={item.categoryName}><td>{item.categoryName}</td><td>{formatCurrency(item.totalAmount)}</td></tr>
                )) : <tr><td colSpan="2">No category spending to report for this month.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
