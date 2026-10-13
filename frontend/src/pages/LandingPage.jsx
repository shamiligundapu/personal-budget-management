import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="hero-header">
        <div className="nav-inline">
          <div className="brand-inline">
            <span className="brand-mark small">₹</span>
            <strong>BudgetFlow</strong>
          </div>
          <div className="header-actions">
            <Link className="secondary-button" to="/login">Login</Link>
            <Link className="primary-button" to="/register">Create account</Link>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div>
          <p className="eyebrow">Personal budget management</p>
          <h1>Take control of your money with confidence.</h1>
          <p className="lead">
            Track income, expenses, budgets, savings goals, and spending trends from one clean dashboard.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">Start free</Link>
            <Link className="secondary-button" to="/login">See demo</Link>
          </div>
        </div>
        <div className="hero-stat-box">
          <div className="mini-card">
            <span>Income</span>
            <strong>₹48,200</strong>
          </div>
          <div className="mini-card">
            <span>Expenses</span>
            <strong>₹31,400</strong>
          </div>
          <div className="mini-card accent">
            <span>Saved</span>
            <strong>₹16,800</strong>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Smart dashboard</h3>
          <p>See your latest totals, trends, and utilization instantly.</p>
        </div>
        <div className="feature-card">
          <h3>Budget control</h3>
          <p>Monitor category-wise spending and get alerts at 80% of a budget and when you exceed it.</p>
        </div>
        <div className="feature-card">
          <h3>Goal tracking</h3>
          <p>Set savings goals and watch your progress toward each target.</p>
        </div>
      </section>
    </div>
  )
}
