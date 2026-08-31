export type UserRole = 'user' | 'admin'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  is_superuser?: boolean
  is_admin?: boolean
}

export interface Vacancy {
  id: number
  title: string
  experience: string
  job_type: string
  qualification: string
  required_skills: string
  posted_by?: number
  deadline: string
  created_at?: string
  updated_at?: string
}

export interface CandidateStatusRecord {
  id: number
  name: string
  email: string
  vacancyTitle: string
  status: 'accepted' | 'rejected'
  appliedAt: string
}

export interface ApplicationRecord {
  id: number
  vacancyId: number
  title: string
  company: string
  appliedAt: string
  status: 'pending' | 'accepted' | 'rejected'
}
