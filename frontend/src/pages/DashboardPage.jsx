import { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js'
import api from '../api/axios'
import { formatCurrency } from '../utils/formatters'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary')
        setDashboard(response.data)
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const incomeExpenseData = useMemo(() => ({
    labels: dashboard?.monthlyTrend?.map((item) => item.month.slice(0, 3)) || [],
    datasets: [
      {
        label: 'Income',
        data: dashboard?.monthlyTrend?.map((item) => Number(item.income || 0)) || [],
        borderColor: '#2d6cdf',
        backgroundColor: 'rgba(45,108,223,0.2)',
      },
      {
        label: 'Expense',
        data: dashboard?.monthlyTrend?.map((item) => Number(item.expense || 0)) || [],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.2)',
      },
    ],
  }), [dashboard])

  const categoryData = useMemo(() => ({
    labels: dashboard?.categoryBreakdown?.map((item) => item.categoryName) || [],
    datasets: [{
      data: dashboard?.categoryBreakdown?.map((item) => Number(item.totalAmount || 0)) || [],
      backgroundColor: ['#2563eb', '#7c3aed', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'],
    }],
  }), [dashboard])

  if (loading) {
    return <div className="section-loading">Loading dashboard...</div>
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {error && <div className="error-box" role="alert">{error}</div>}

      {dashboard?.budgetAlerts?.length > 0 && (
        <section className="budget-alert-list" aria-label="Budget alerts">
          {dashboard.budgetAlerts.map((budget) => {
            const spent = Number(budget.totalSpent || 0)
            const limit = Number(budget.monthlyLimit || 0)
            const isExceeded = spent > limit

            return (
              <div key={budget.id} className={`budget-alert${isExceeded ? ' over-budget' : ''}`} role={isExceeded ? 'alert' : 'status'}>
                <strong>{isExceeded ? 'Budget exceeded' : 'Spending alert'}: {budget.categoryName}</strong>
                <span>
                  {isExceeded
                    ? `${formatCurrency(spent - limit)} over the ${formatCurrency(limit)} limit.`
                    : `${Number(budget.utilizationPercentage).toFixed(1)}% of the ${formatCurrency(limit)} budget used.`}
                </span>
              </div>
            )
          })}
        </section>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total income</span>
          <strong>{formatCurrency(dashboard?.totalIncome)}</strong>
        </div>
        <div className="stat-card">
          <span>Total expenses</span>
          <strong>{formatCurrency(dashboard?.totalExpenses)}</strong>
        </div>
        <div className="stat-card">
          <span>Available balance</span>
          <strong>{formatCurrency(dashboard?.balance)}</strong>
        </div>
        <div className="stat-card">
          <span>Savings</span>
          <strong>{formatCurrency(dashboard?.totalSavings)}</strong>
        </div>
      </div>

      <div className="info-row">
        <div className="panel-card">
          <h3>Monthly budget utilization</h3>
          <div className="big-value">{Number(dashboard?.monthlyBudgetUtilization || 0).toFixed(1)}%</div>
        </div>
        <div className="panel-card">
          <h3>Savings rate</h3>
          <div className="big-value">{Number(dashboard?.savingsRate || 0).toFixed(1)}%</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="panel-card chart-card">
          <h3>Income vs expense trend</h3>
          {dashboard?.monthlyTrend?.some((item) => Number(item.income) > 0 || Number(item.expense) > 0)
            ? <Bar data={incomeExpenseData} options={{ responsive: true, maintainAspectRatio: false }} />
            : <p>No transaction history available for this year.</p>}
        </div>

        <div className="panel-card chart-card">
          <h3>Category spending</h3>
          {dashboard?.categoryBreakdown?.length
            ? <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            : <p>No expense categories for this month yet.</p>}
        </div>
      </div>

      <div className="panel-card table-card">
        <h3>Recent transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard?.recentTransactions || []).length === 0 ? (
              <tr><td colSpan="4">No transactions yet. Add one to see your financial activity.</td></tr>
            ) : dashboard.recentTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.categoryName}</td>
                <td>{transaction.type}</td>
                <td>{transaction.transactionDate}</td>
                <td>{formatCurrency(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
