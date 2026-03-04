import api from './api'
import type { JobDescription, CreateJDRequest, PaginatedResponse } from '../types'

export const jdService = {
  getAll: async (): Promise<JobDescription[]> => {
    const response = await api.get<PaginatedResponse<JobDescription>>('/job-descriptions')
    return response.data.data
  },

  getById: async (id: string): Promise<JobDescription> => {
    const response = await api.get<JobDescription>(`/job-descriptions/${id}`)
    return response.data
  },

  create: async (data: CreateJDRequest): Promise<JobDescription> => {
    const response = await api.post<JobDescription>('/job-descriptions', data)
    return response.data
  },

  update: async (id: string, data: Partial<CreateJDRequest>): Promise<JobDescription> => {
    const response = await api.put<JobDescription>(`/job-descriptions/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/job-descriptions/${id}`)
  },
}
