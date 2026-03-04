import api from './api'
import type { JobDescription, CreateJDRequest, PaginatedResponse } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): JobDescription {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.content ?? '',
    requirements: '',
    extractedSkills: [
      ...(raw.requiredSkills ?? []),
      ...(raw.preferredSkills ?? []),
    ],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export const jdService = {
  getAll: async (): Promise<JobDescription[]> => {
    const response = await api.get<PaginatedResponse<unknown>>('/job-descriptions')
    return response.data.data.map(normalize)
  },

  getById: async (id: string): Promise<JobDescription> => {
    const response = await api.get<unknown>(`/job-descriptions/${id}`)
    return normalize(response.data)
  },

  create: async (data: CreateJDRequest): Promise<JobDescription> => {
    const content = data.requirements
      ? `${data.description}\n\nRequirements:\n${data.requirements}`
      : data.description
    const response = await api.post<unknown>('/job-descriptions', {
      title: data.title,
      content,
    })
    return normalize(response.data)
  },

  update: async (id: string, data: Partial<CreateJDRequest>): Promise<JobDescription> => {
    const payload: Record<string, string> = {}
    if (data.title) payload.title = data.title
    if (data.description || data.requirements) {
      payload.content = data.requirements
        ? `${data.description ?? ''}\n\nRequirements:\n${data.requirements}`
        : (data.description ?? '')
    }
    const response = await api.put<unknown>(`/job-descriptions/${id}`, payload)
    return normalize(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/job-descriptions/${id}`)
  },
}
