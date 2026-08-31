import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Send, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '../context/auth-context'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { Skeleton } from '../components/ui/skeleton'

interface VacancyItem {
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

interface ResumeItem {
  id: number
  name: string
  email: string
  resume_file: string
  vacancy: number | string
  applied_at: string
}

interface VacancyEvaluationEntry {
  resume_id: number
  name: string
  email: string
  evaluation?: {
    decision?: string
    [key: string]: unknown
  }
  decision?: string
}

const vacancySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  experience: z.string().min(1, 'Experience is required'),
  job_type: z.string().min(1, 'Job type is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  required_skills: z.string().min(1, 'Skills are required'),
  deadline: z.string().min(1, 'Deadline is required'),
})

type VacancyFormValues = z.infer<typeof vacancySchema>

const fetchVacancies = async (): Promise<VacancyItem[]> => {
  const response = await api.get('/vacancy/vacancies/')
  const payload = Array.isArray(response.data) ? response.data : response.data.results ?? []
  return payload as VacancyItem[]
}

const fetchResumes = async (): Promise<ResumeItem[]> => {
  const response = await api.get('/vacancy/resumes/')
  const payload = Array.isArray(response.data) ? response.data : response.data.results ?? []
  return payload as ResumeItem[]
}

const fetchAcceptedResumes = async (vacancyId?: number): Promise<ResumeItem[]> => {
  const response = await api.get('/vacancy/accepted-resumes/', {
    params: vacancyId ? { vacancy_id: vacancyId } : {},
  })
  const payload = Array.isArray(response.data) ? response.data : response.data.results ?? []
  return payload as ResumeItem[]
}

const fetchRejectedResumes = async (vacancyId?: number): Promise<ResumeItem[]> => {
  const response = await api.get('/vacancy/rejected-resumes/', {
    params: vacancyId ? { vacancy_id: vacancyId } : {},
  })
  const payload = Array.isArray(response.data) ? response.data : response.data.results ?? []
  return payload as ResumeItem[]
}

const fetchVacancyEvaluation = async (vacancyId: number): Promise<{
  vacancy_id: number
  total_resumes: number
  results: VacancyEvaluationEntry[]
}> => {
  try {
    const response = await api.post('/vacancy/evaluate/', { vacancy_id: vacancyId })
    return response.data as {
      vacancy_id: number
      total_resumes: number
      results: VacancyEvaluationEntry[]
    }
  } catch (error: unknown) {
    const status =
      error && typeof error === 'object' && 'response' in error
        ? Number((error as { response?: { status?: number } }).response?.status)
        : 0

    if (status === 404) {
      return {
        vacancy_id: vacancyId,
        total_resumes: 0,
        results: [],
      }
    }

    throw error
  }
}

export function AdminDashboardPage() {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedApplicationsVacancy, setSelectedApplicationsVacancy] = useState<VacancyItem | null>(null)
  const [deleteDialogOpenId, setDeleteDialogOpenId] = useState<number | null>(null)
  const [evaluatingVacancyId, setEvaluatingVacancyId] = useState<number | null>(null)
  const [mailingVacancyId, setMailingVacancyId] = useState<number | null>(null)

  const vacanciesQuery = useQuery({
    queryKey: ['admin-vacancies'],
    queryFn: fetchVacancies,
    enabled: !!auth.user,
  })

  const resumesQuery = useQuery({
    queryKey: ['admin-resumes'],
    queryFn: fetchResumes,
    enabled: !!auth.user,
  })

  const acceptedResumesQuery = useQuery({
    queryKey: ['admin-accepted-resumes', 'all'],
    queryFn: () => fetchAcceptedResumes(),
    enabled: !!auth.user,
  })

  const rejectedResumesQuery = useQuery({
    queryKey: ['admin-rejected-resumes', 'all'],
    queryFn: () => fetchRejectedResumes(),
    enabled: !!auth.user,
  })

  const vacancyAcceptedQueries = useQuery({
    queryKey: ['admin-vacancy-accepted-resumes', vacanciesQuery.data?.map((vacancy) => vacancy.id).join(',') ?? 'none'],
    queryFn: async () => {
      const activeVacancyIds = (vacanciesQuery.data ?? []).map((vacancy) => vacancy.id)
      if (!activeVacancyIds.length) return {} as Record<number, ResumeItem[]>

      const entries = await Promise.all(
        activeVacancyIds.map(async (vacancyId) => [vacancyId, await fetchAcceptedResumes(vacancyId)] as const),
      )

      return Object.fromEntries(entries) as Record<number, ResumeItem[]>
    },
    enabled: !!auth.user && !!vacanciesQuery.data?.length,
  })

  const vacancyRejectedQueries = useQuery({
    queryKey: ['admin-vacancy-rejected-resumes', vacanciesQuery.data?.map((vacancy) => vacancy.id).join(',') ?? 'none'],
    queryFn: async () => {
      const activeVacancyIds = (vacanciesQuery.data ?? []).map((vacancy) => vacancy.id)
      if (!activeVacancyIds.length) return {} as Record<number, ResumeItem[]>

      const entries = await Promise.all(
        activeVacancyIds.map(async (vacancyId) => [vacancyId, await fetchRejectedResumes(vacancyId)] as const),
      )

      return Object.fromEntries(entries) as Record<number, ResumeItem[]>
    },
    enabled: !!auth.user && !!vacanciesQuery.data?.length,
  })

  const adminVacancyIds = new Set((vacanciesQuery.data ?? []).map((vacancy) => vacancy.id))
  const candidateRows = (resumesQuery.data ?? [])
    .filter((resume) => adminVacancyIds.has(Number(resume.vacancy)))
    .map((resume) => ({
      ...resume,
      vacancyTitle:
        vacanciesQuery.data?.find((vacancy) => vacancy.id === Number(resume.vacancy))?.title ?? 'Unknown vacancy',
    }))

  const acceptedApplicants = (acceptedResumesQuery.data ?? [])
    .filter((resume) => adminVacancyIds.has(Number(resume.vacancy)))
    .map((resume) => ({
      ...resume,
      vacancyId: Number(resume.vacancy),
      vacancyTitle: vacanciesQuery.data?.find((vacancy) => vacancy.id === Number(resume.vacancy))?.title ?? 'Unknown vacancy',
    }))

  const rejectedApplicants = (rejectedResumesQuery.data ?? [])
    .filter((resume) => adminVacancyIds.has(Number(resume.vacancy)))
    .map((resume) => ({
      ...resume,
      vacancyId: Number(resume.vacancy),
      vacancyTitle: vacanciesQuery.data?.find((vacancy) => vacancy.id === Number(resume.vacancy))?.title ?? 'Unknown vacancy',
    }))

  const getVacancyOutcomeCounts = (vacancyId: number) => ({
    accepted: (vacancyAcceptedQueries.data?.[vacancyId] ?? []).length,
    rejected: (vacancyRejectedQueries.data?.[vacancyId] ?? []).length,
  })

  const createForm = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: '',
      experience: '',
      job_type: 'FULL_TIME',
      qualification: '',
      required_skills: '',
      deadline: '',
    },
  })

  const editForm = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: '',
      experience: '',
      job_type: 'FULL_TIME',
      qualification: '',
      required_skills: '',
      deadline: '',
    },
  })

  const createVacancyMutation = useMutation({
    mutationFn: async (values: VacancyFormValues) => {
      await api.post('/vacancy/vacancies/', {
        ...values,
        posted_by: auth.user?.id,
      })
    },
    onSuccess: () => {
      toast.success('Vacancy created successfully.')
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] })
      createForm.reset()
      setCreating(false)
    },
    onError: () => {
      toast.error('Vacancy creation failed. Please try again.')
    },
  })

  const updateVacancyMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: VacancyFormValues }) => {
      await api.patch(`/vacancy/vacancies/${id}/`, values)
    },
    onSuccess: () => {
      toast.success('Vacancy updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] })
      editForm.reset()
      setEditingId(null)
    },
    onError: () => {
      toast.error('Vacancy update failed. Please try again.')
    },
  })

  const deleteVacancyMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/vacancy/vacancies/${id}/`)
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<VacancyItem[]>(['admin-vacancies'], (current) =>
        (current ?? []).filter((vacancy) => vacancy.id !== deletedId),
      )
      queryClient.setQueryData<VacancyItem[]>(['vacancies'], (current) =>
        (current ?? []).filter((vacancy) => vacancy.id !== deletedId),
      )
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vacancies'] })
      setDeleteDialogOpenId(null)
      toast.success('Vacancy deleted successfully.')
    },
    onError: () => {
      setDeleteDialogOpenId(null)
      toast.error('Vacancy deletion failed. Please try again.')
    },
  })

  const evaluateVacancyMutation = useMutation({
    mutationFn: async (vacancyId: number) => fetchVacancyEvaluation(vacancyId),
    onMutate: (vacancyId) => {
      setEvaluatingVacancyId(vacancyId)
    },
    onSuccess: () => {
      toast.success('Candidate evaluation completed.')
      queryClient.invalidateQueries({ queryKey: ['admin-resumes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-accepted-resumes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-rejected-resumes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vacancy-accepted-resumes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vacancy-rejected-resumes'] })
    },
    onSettled: () => {
      setEvaluatingVacancyId(null)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error ||
            (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            'Evaluation failed.'
          : 'Evaluation failed.'
      setEvaluatingVacancyId(null)
      toast.error(typeof message === 'string' ? message : 'Evaluation failed.')
    },
  })

  const sendEmailsMutation = useMutation({
    mutationFn: async (vacancyId: number) => {
      const response = await api.post('/vacancy/send-email/', { vacancy_id: vacancyId })
      return response.data
    },
    onMutate: (vacancyId) => {
      setMailingVacancyId(vacancyId)
    },
    onSuccess: (data: { message?: string; total_sent?: number }) => {
      toast.success(data.message || `Emails sent to ${data.total_sent ?? 0} candidates.`)
    },
    onSettled: () => {
      setMailingVacancyId(null)
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string; detail?: string } } }).response?.data?.error ||
            (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            'Mail sending failed.'
          : 'Mail sending failed.'
      setMailingVacancyId(null)
      toast.error(typeof message === 'string' ? message : 'Mail sending failed.')
    },
  })

  const openEditDialog = (vacancy: VacancyItem) => {
    setEditingId(vacancy.id)
    editForm.reset({
      title: vacancy.title,
      experience: vacancy.experience,
      job_type: vacancy.job_type,
      qualification: vacancy.qualification,
      required_skills: vacancy.required_skills,
      deadline: vacancy.deadline ? new Date(vacancy.deadline).toISOString().slice(0, 16) : '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold">Manage vacancies and hiring workflows.</h1>
        </div>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post Vacancy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create vacancy</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit((values) => createVacancyMutation.mutate(values))} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Vacancy title</Label>
                <Input id="title" placeholder="e.g. Senior Frontend Engineer" {...createForm.register('title')} className="h-11 text-foreground" />
                {createForm.formState.errors.title && <p className="text-sm text-red-500">{createForm.formState.errors.title.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">Experience required</Label>
                  <Input id="experience" placeholder="2-4 years" {...createForm.register('experience')} className="h-11 text-foreground" />
                  {createForm.formState.errors.experience && <p className="text-sm text-red-500">{createForm.formState.errors.experience.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_type" className="text-sm font-medium">Employment type</Label>
                  <select id="job_type" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground" {...createForm.register('job_type')}>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification" className="text-sm font-medium">Minimum qualification</Label>
                <Textarea id="qualification" placeholder="Describe education or credentials required" className="min-h-24 text-foreground" {...createForm.register('qualification')} />
                {createForm.formState.errors.qualification && <p className="text-sm text-red-500">{createForm.formState.errors.qualification.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_skills" className="text-sm font-medium">Required skills</Label>
                <Input id="required_skills" placeholder="React, TypeScript, API integration" {...createForm.register('required_skills')} className="h-11 text-foreground" />
                {createForm.formState.errors.required_skills && <p className="text-sm text-red-500">{createForm.formState.errors.required_skills.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">Application deadline</Label>
                <Input id="deadline" type="datetime-local" {...createForm.register('deadline')} className="h-11 text-foreground" />
                {createForm.formState.errors.deadline && <p className="text-sm text-red-500">{createForm.formState.errors.deadline.message}</p>}
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createVacancyMutation.isPending}>
                  {createVacancyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save vacancy
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active Vacancies', value: vacanciesQuery.data?.length ?? 0 },
          { label: 'Shortlisted', value: acceptedApplicants.length },
          { label: 'Rejected', value: rejectedApplicants.length },
          { label: 'Applications', value: candidateRows.length },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-3">
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Vacancy List</h2>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add vacancy
          </Button>
        </div>

        {vacanciesQuery.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : vacanciesQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Unable to load vacancies.
          </div>
        ) : vacanciesQuery.data?.length ? (
          <div className="space-y-3">
            {vacanciesQuery.data.map((vacancy) => (
              <div key={vacancy.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold">{vacancy.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{vacancy.job_type.replace('_', ' ')}</span>
                    <span>{vacancy.experience}</span>
                    <span>{candidateRows.filter((candidate) => candidate.vacancy === vacancy.id).length} applicants</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                      Accepted: {getVacancyOutcomeCounts(vacancy.id).accepted}
                    </span>
                    <span className="rounded-full bg-red-500/10 px-2 py-1 text-red-700 dark:text-red-300">
                      Rejected: {getVacancyOutcomeCounts(vacancy.id).rejected}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplicationsVacancy(vacancy)}
                  >
                    {`Applications (${candidateRows.filter((candidate) => candidate.vacancy === vacancy.id).length})`}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => evaluateVacancyMutation.mutate(vacancy.id)}
                    disabled={evaluatingVacancyId === vacancy.id}
                  >
                    {evaluatingVacancyId === vacancy.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                    Evaluate
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendEmailsMutation.mutate(vacancy.id)}
                    disabled={mailingVacancyId === vacancy.id}
                  >
                    {mailingVacancyId === vacancy.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                    Mail
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => openEditDialog(vacancy)}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>

                  <AlertDialog open={deleteDialogOpenId === vacancy.id} onOpenChange={(open) => setDeleteDialogOpenId(open ? vacancy.id : null)}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Delete Vacancy?</h3>
                        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </AlertDialogCancel>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={async () => {
                            await deleteVacancyMutation.mutateAsync(vacancy.id)
                          }}
                          disabled={deleteVacancyMutation.isPending}
                        >
                          {deleteVacancyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
            No vacancies posted yet.
          </div>
        )}
      </div>

      <Dialog open={selectedApplicationsVacancy !== null} onOpenChange={(open) => !open && setSelectedApplicationsVacancy(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Applications for {selectedApplicationsVacancy?.title}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {selectedApplicationsVacancy && (
              (() => {
                const vacancyApplicants = candidateRows.filter((candidate) => candidate.vacancy === selectedApplicationsVacancy.id)

                if (!vacancyApplicants.length) {
                  return (
                    <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
                      No applications for this vacancy yet.
                    </div>
                  )
                }

                return vacancyApplicants.map((candidate) => (
                  <div key={candidate.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                      <a
                        href={candidate.resume_file}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View resume
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Applied on {new Date(candidate.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              })()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit vacancy</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit((values) => {
            if (editingId !== null) {
              updateVacancyMutation.mutate({ id: editingId, values })
            }
          })} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium">Vacancy title</Label>
              <Input id="edit-title" {...editForm.register('title')} className="h-11 text-foreground" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-experience" className="text-sm font-medium">Experience required</Label>
                <Input id="edit-experience" {...editForm.register('experience')} className="h-11 text-foreground" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-job-type" className="text-sm font-medium">Employment type</Label>
                <select id="edit-job-type" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground" {...editForm.register('job_type')}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-qualification" className="text-sm font-medium">Minimum qualification</Label>
              <Textarea id="edit-qualification" className="min-h-24 text-foreground" {...editForm.register('qualification')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-skills" className="text-sm font-medium">Required skills</Label>
              <Input id="edit-skills" {...editForm.register('required_skills')} className="h-11 text-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deadline" className="text-sm font-medium">Application deadline</Label>
              <Input id="edit-deadline" type="datetime-local" {...editForm.register('deadline')} className="h-11 text-foreground" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button type="submit" disabled={updateVacancyMutation.isPending}>
                {updateVacancyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update vacancy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
