import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('budgetAuthToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        localStorage.removeItem('budgetAuthToken')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = (authToken, authUser) => {
    localStorage.setItem('budgetAuthToken', authToken)
    setToken(authToken)
    setUser(authUser)
  }

  const logout = () => {
    localStorage.removeItem('budgetAuthToken')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = useMemo(
    () => ({ user, token, login, logout, updateUser, loading, isAuthenticated: Boolean(token && user) }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
