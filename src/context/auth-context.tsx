import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { User } from '../types'
import { api } from '../lib/api'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: { username: string; password: string }) => Promise<User>
  register: (credentials: {
    username: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const parseAdminFlag = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return false
}

const decodeJwtAdminFlag = (token: string | null): boolean => {
  if (!token) return false

  try {
    const payload = token.split('.')[1]
    if (!payload) return false

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return parseAdminFlag(decoded.is_superuser ?? decoded.is_superuser ?? decoded.is_admin ?? decoded.isAdmin)
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('talentlens_user')
    const savedToken = localStorage.getItem('talentlens_access_token')

    if (savedUser) {
      const parsed = JSON.parse(savedUser) as Partial<User> & { isAdmin?: boolean; is_superuser?: boolean }
      const isAdmin = parseAdminFlag(parsed.is_superuser ?? parsed.is_admin ?? parsed.isAdmin)
      setUser({
        id: Number(parsed.id ?? Date.now()),
        username: parsed.username ?? '',
        email: parsed.email ?? '',
        role: isAdmin ? 'admin' : 'user',
        is_superuser: isAdmin,
        is_admin: isAdmin,
      })
    }

    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const persistAuth = useCallback((nextUser: User | null, nextToken: string | null) => {
    setUser(nextUser)
    setToken(nextToken)

    if (nextUser) {
      localStorage.setItem('talentlens_user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('talentlens_user')
    }

    if (nextToken) {
      localStorage.setItem('talentlens_access_token', nextToken)
    } else {
      localStorage.removeItem('talentlens_access_token')
    }
  }, [])

  const login = useCallback(
    async ({ username, password }: { username: string; password: string }) => {
      const response = await api.post<{
        access: string
        refresh: string
        is_superuser?: boolean
        is_admin?: boolean
        isAdmin?: boolean
        user?: Partial<User> & { is_superuser?: boolean; is_admin?: boolean; isAdmin?: boolean }
      }>('/auth/login/', {
        username,
        password,
      })

      const backendIsAdmin =
        parseAdminFlag(response.data.is_superuser) ||
        parseAdminFlag(response.data.is_admin) ||
        parseAdminFlag(response.data.isAdmin) ||
        parseAdminFlag(response.data.user?.is_superuser) ||
        parseAdminFlag(response.data.user?.is_admin) ||
        parseAdminFlag(response.data.user?.isAdmin) ||
        decodeJwtAdminFlag(response.data.access)

      const nextUser: User = {
        id: Number(response.data.user?.id ?? Date.now()),
        username: response.data.user?.username ?? username,
        email: response.data.user?.email ?? `${username}@example.com`,
        role: backendIsAdmin ? 'admin' : 'user',
        is_superuser: backendIsAdmin,
        is_admin: backendIsAdmin,
      }

      persistAuth(nextUser, response.data.access)
      localStorage.setItem('talentlens_refresh_token', response.data.refresh)

      return nextUser
    },
    [persistAuth],
  )

  const register = useCallback(
    async ({ username, email, password }: { username: string; email: string; password: string }) => {
      await api.post('/auth/register/', {
        username,
        email,
        password1: password,
        password2: password,
      })
    },
    [],
  )

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('talentlens_refresh_token')

    if (refresh) {
      try {
        await api.post('/auth/logout/', { refresh })
      } catch {
        // ignore logout API errors and continue clearing local state
      }
    }

    persistAuth(null, null)
    localStorage.removeItem('talentlens_refresh_token')
  }, [persistAuth])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: parseAdminFlag(user?.is_superuser ?? user?.is_admin ?? user?.role === 'admin'),
      login,
      register,
      logout,
    }),
    [login, logout, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
