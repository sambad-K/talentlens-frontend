import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUp, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

interface VacancyDetail {
  id: number
  title: string
  experience: string
  job_type: string
  qualification: string
}

const fetchVacancy = async (id: string): Promise<VacancyDetail> => {
  const response = await api.get(`/vacancy/vacancies/${id}/`)
  return response.data as VacancyDetail
}

const applySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  file: z.any().refine((value) => value instanceof File && value.size > 0, 'Please upload your CV'),
})

type ApplyValues = z.infer<typeof applySchema>

export function ApplyPage() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false })
  const [isUploading, setIsUploading] = useState(false)

  const { data: vacancy, isPending } = useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => fetchVacancy(String(id)),
    enabled: Boolean(id),
  })

  const form = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { name: '', email: '', file: undefined },
  })

  const handleSubmit = async (values: ApplyValues) => {
    setIsUploading(true)
    try {
      const selectedVacancyId = String(vacancy?.id ?? id ?? '')

      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)
      formData.append('vacancy', selectedVacancyId)
      formData.append('vacancy_id', selectedVacancyId)
      formData.append('resume_file', values.file)

      await api.post('/vacancy/resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Application submitted successfully.')
      navigate({ to: '/vacancies' })
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error ||
            (error as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.detail ||
            'Application failed. Please try again.'
          : 'Application failed. Please try again.'
      toast.error(typeof message === 'string' ? message : 'Application failed.')
    } finally {
      setIsUploading(false)
    }
  }

  if (isPending || !vacancy) {
    return <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">Loading application form...</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Apply for {vacancy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
            <p><strong>{vacancy.title}</strong></p>
            <p>{vacancy.job_type.replace('_', ' ')}</p>
            <p>{vacancy.experience}</p>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">CV / Resume Upload</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  form.setValue('file', file ?? undefined)
                }}
              />
              {form.formState.errors.file && <p className="text-sm text-red-500">{String(form.formState.errors.file.message)}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting application...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
