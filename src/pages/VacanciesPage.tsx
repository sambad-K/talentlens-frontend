import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { BriefcaseBusiness, Search, MapPin, CalendarDays, Filter, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { api, extractArrayResponse } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'

interface VacancyApiItem {
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

const fetchVacancies = async (): Promise<VacancyApiItem[]> => {
  const response = await api.get('/vacancy/vacancies/')
  return extractArrayResponse(response.data) as VacancyApiItem[]
}

export function VacanciesPage() {
  const [query, setQuery] = useState('')
  const [jobType, setJobType] = useState('all')

  const { data, isPending, isError } = useQuery({
    queryKey: ['vacancies'],
    queryFn: fetchVacancies,
  })

  const filteredVacancies = useMemo(() => {
    if (!data) return []
    return data.filter((vacancy) => {
      const matchesQuery =
        vacancy.title.toLowerCase().includes(query.toLowerCase()) ||
        vacancy.qualification.toLowerCase().includes(query.toLowerCase()) ||
        vacancy.required_skills.toLowerCase().includes(query.toLowerCase())

      const matchesType = jobType === 'all' || vacancy.job_type === jobType
      return matchesQuery && matchesType
    })
  }, [data, jobType, query])

  if (isError) {
    toast.error('Unable to load vacancies right now.')
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
        We couldn’t load vacancies. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vacancies</h1>
          <p className="text-muted-foreground">Explore available opportunities and apply when ready.</p>
        </div>
        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vacancies" className="pl-9" />
          </div>
          <select
            value={jobType}
            onChange={(event) => setJobType(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-0">
              <CardHeader className="space-y-3 p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVacancies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No vacancies are currently available.</h3>
          <p className="mt-2 text-muted-foreground">Try a different search or check back later for new roles.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredVacancies.map((vacancy) => (
            <Card key={vacancy.id} className="overflow-hidden">
              <CardHeader className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{vacancy.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">TalentLens</p>
                  </div>
                  <Badge variant="secondary">{vacancy.job_type.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-0">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Remote</div>
                  <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Posted {new Date(vacancy.created_at || vacancy.deadline).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><Filter className="h-4 w-4" />{vacancy.experience}</div>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">{vacancy.qualification}</p>
                <Button asChild className="w-full">
                  <Link to="/vacancies/$id" params={{ id: String(vacancy.id) }}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
