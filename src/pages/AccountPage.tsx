import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { FileText, UserCircle2 } from 'lucide-react'
import { useAuth } from '../context/auth-context'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'

interface ApplicationItem {
  id: number
  title: string
  company: string
  appliedAt: string
  status: 'submitted' | 'shortlisted' | 'rejected'
}

const fetchUserApplications = async (): Promise<ApplicationItem[]> => {
  const response = await api.get('/vacancy/resumes/')
  const items = Array.isArray(response.data) ? response.data : response.data.results ?? []

  return items.map((item: Record<string, unknown>, index: number) => ({
    id: Number(item.id ?? index),
    title: String(item.vacancyTitle ?? item.title ?? 'Application'),
    company: String(item.company ?? 'TalentLens'),
    appliedAt: String(item.applied_at ?? item.created_at ?? new Date().toISOString()),
    status: 'submitted',
  }))
}

export function AccountPage() {
  const auth = useAuth()

  const applicationsQuery = useQuery({
    queryKey: ['applications', auth.user?.id],
    queryFn: fetchUserApplications,
    enabled: !!auth.user,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserCircle2 className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Username:</strong> {auth.user?.username}</p>
          <p><strong className="text-foreground">Email:</strong> {auth.user?.email || 'noreply@example.com'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-5 w-5" />
            My Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicationsQuery.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : applicationsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              Unable to load your applications.
            </div>
          ) : applicationsQuery.data?.length ? (
            <div className="space-y-3">
              {applicationsQuery.data.map((application) => (
                <div key={application.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{application.title}</h3>
                    <p className="text-sm text-muted-foreground">{application.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={
                        application.status === 'shortlisted'
                          ? 'success'
                          : application.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-lg font-medium">No applications submitted yet.</p>
              <Link to="/vacancies">
                <Button className="mt-4">Browse Vacancies</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
