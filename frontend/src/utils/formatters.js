export const formatCurrency = (value) => {
  const number = Number(value ?? 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number)
}

export const formatPercent = (value) => `${Number(value ?? 0).toFixed(1)}%`

export const getMonthLabel = (monthName) => monthName ? monthName.slice(0, 3) : ''
