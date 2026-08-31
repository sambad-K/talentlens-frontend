import { useQuery } from '@tanstack/react-query'
import { api, extractArrayResponse } from '../lib/api'

export interface VacancyRecord {
  id: number
  title: string
  experience: string
  job_type: string
  qualification: string
  required_skills: string
  deadline: string
  created_at?: string
  updated_at?: string
  posted_by?: number
}

const fetchVacancies = async (): Promise<VacancyRecord[]> => {
  const response = await api.get('/vacancy/vacancies/')
  return extractArrayResponse(response.data) as VacancyRecord[]
}

export function useVacancies() {
  return useQuery({
    queryKey: ['vacancies'],
    queryFn: fetchVacancies,
  })
}

export function useVacancy(id: number | string | undefined) {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing vacancy id')
      const response = await api.get(`/vacancy/vacancies/${id}/`)
      return response.data as VacancyRecord
    },
    enabled: Boolean(id),
  })
}
