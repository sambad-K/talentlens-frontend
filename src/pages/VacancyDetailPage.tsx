import { useQuery } from '@tanstack/react-query'
import { Link, useParams, Navigate } from '@tanstack/react-router'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, TimerReset } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/auth-context'
import { api } from '../lib/api'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

interface VacancyDetail {
  id: number
  title: string
  experience: string
  job_type: string
  qualification: string
  required_skills: string
  deadline: string
  created_at: string
  posted_by?: number
}

const fetchVacancy = async (id: string): Promise<VacancyDetail> => {
  const response = await api.get(`/vacancy/vacancies/${id}/`)
  return response.data as VacancyDetail
}

export function VacancyDetailPage() {
  const { id } = useParams({ strict: false })
  const auth = useAuth()

  const { data, isPending, isError } = useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => fetchVacancy(String(id)),
    enabled: Boolean(id),
  })

  if (isError) {
    toast.error('Vacancy details could not be loaded.')
    return <Navigate to="/vacancies" replace />
  }

  if (isPending || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-2">
        <Link to="/vacancies" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to vacancies
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Opportunity</p>
              <CardTitle className="mt-2 text-3xl">{data.title}</CardTitle>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
              {data.job_type.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />TalentLens</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />Remote</span>
            <span className="inline-flex items-center gap-2"><TimerReset className="h-4 w-4" />{data.experience}</span>
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />Posted {new Date(data.created_at || data.deadline).toLocaleDateString()}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground">{data.qualification}</p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">Required skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.required_skills.split(',').map((skill) => (
                    <Badge key={skill} variant="outline">{skill.trim()}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <h3 className="mb-3 text-lg font-semibold">Role summary</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Type: {data.job_type.replace('_', ' ')}</p>
                <p>Experience: {data.experience}</p>
                <p>Location: Remote</p>
                <p>Deadline: {new Date(data.deadline).toLocaleDateString()}</p>
              </div>

              {!auth.isAuthenticated ? (
                <Button asChild className="mt-5 w-full" variant="outline">
                  <Link to="/login">Login to apply</Link>
                </Button>
              ) : (
                <Button asChild className="mt-5 w-full">
                  <Link to="/vacancies/$id/apply" params={{ id: String(data.id) }}>
                    Apply Now
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
