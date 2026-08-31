import { Link } from '@tanstack/react-router'
import { FileText, UserCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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

interface SubmittedResumeItem {
  id: number
  name: string
  email: string
  resume_file: string
  vacancy: number | string
  applied_at: string
}

const fetchUserApplications = async (): Promise<ApplicationItem[]> => {
  const response = await api.get('/vacancy/submitted-resumes/')
  const items = Array.isArray(response.data) ? response.data : response.data.results ?? []

  const submissions = items as SubmittedResumeItem[]

  return Promise.all(
    submissions.map(async (item, index) => {
      let title = 'Application'
      let company = 'TalentLens'

      if (item.vacancy) {
        try {
          const vacancyResponse = await api.get(`/vacancy/vacancies/${item.vacancy}/`)
          const vacancy = vacancyResponse.data as { title?: string; company?: string }
          title = vacancy.title ?? title
          company = vacancy.company ?? company
        } catch {
          title = 'Application'
        }
      }

      return {
        id: Number(item.id ?? index),
        title,
        company,
        appliedAt: String(item.applied_at ?? new Date().toISOString()),
        status: 'submitted',
      }
    }),
  )
}

export function UserDashboardPage() {
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
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Username:</strong> {auth.user?.username}</p>
          <p><strong className="text-foreground">Email:</strong> {auth.user?.email || 'noreply@example.com'}</p>
          <p><strong className="text-foreground">Role:</strong> Candidate</p>
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
