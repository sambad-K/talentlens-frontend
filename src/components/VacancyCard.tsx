import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, Filter, MapPin } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import type { VacancyRecord } from '../hooks/useVacancies'

export function VacancyCard({ vacancy }: { vacancy: VacancyRecord }) {
  return (
    <Card className="overflow-hidden">
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
  )
}
