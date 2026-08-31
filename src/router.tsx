import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  useLocation,
} from '@tanstack/react-router'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VacanciesPage } from './pages/VacanciesPage'
import { VacancyDetailPage } from './pages/VacancyDetailPage'
import { ApplyPage } from './pages/ApplyPage'
import { UserDashboardPage } from './pages/UserDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { Navbar } from './components/Navbar'
import { useAuth } from './context/auth-context'

function RootLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container-shell py-6 sm:py-8">
        <div key={location.pathname} className="page-shell">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const rootRoute = createRootRoute({ component: RootLayout })

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const auth = useAuth()
    if (auth.isAuthenticated && auth.isAdmin) {
      return <Navigate to="/account" replace />
    }
    return <HomePage />
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const vacanciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vacancies',
  component: () => {
    const auth = useAuth()
    if (auth.isAuthenticated && auth.isAdmin) {
      return <Navigate to="/account" replace />
    }
    return <VacanciesPage />
  },
})

const vacancyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vacancies/$id',
  component: VacancyDetailPage,
})

const applyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vacancies/$id/apply',
  component: () => {
    const auth = useAuth()
    if (auth.isAuthenticated && auth.isAdmin) {
      return <Navigate to="/account" replace />
    }
    return <ApplyPage />
  },
})

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: () => {
    const auth = useAuth()
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    if (auth.isAdmin) {
      return <AdminDashboardPage />
    }
    return <UserDashboardPage />
  },
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  vacanciesRoute,
  vacancyDetailRoute,
  applyRoute,
  accountRoute,
])

export const router = createRouter({ routeTree })

export function AppRouter() {
  return <RouterProvider router={router} />
}
