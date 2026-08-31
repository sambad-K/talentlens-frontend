import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Menu, Moon, SunMedium, BriefcaseBusiness, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '../context/auth-context'
import { useTheme } from '../context/theme-context'
import { cn } from '../lib/utils'

export function Navbar() {
  const auth = useAuth()

  const navItems = auth.isAuthenticated && auth.isAdmin
    ? [{ label: 'Dashboard', to: '/account' }]
    : [
        { label: 'Home', to: '/' },
        { label: 'Vacancies', to: '/vacancies' },
      ]
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    await auth.logout()
    navigate({ to: '/' })
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <span>TalentLens</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}

          {!auth.isAuthenticated ? (
            <Link to="/login" className={cn('rounded-md px-3 py-2 text-sm font-medium', isActive('/login') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
              Login
            </Link>
          ) : (
            <>
              {!auth.isAdmin && (
                <Link to="/account" className={cn('rounded-md px-3 py-2 text-sm font-medium', isActive('/account') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  Account
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-shell flex flex-col gap-2 py-3">
            {[
              ...navItems,
              ...(!auth.isAuthenticated ? [{ label: 'Login', to: '/login' }] : auth.isAdmin ? [] : [{ label: 'Account', to: '/account' }]),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium',
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}

            {auth.isAuthenticated && (
              <Button variant="outline" className="justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
