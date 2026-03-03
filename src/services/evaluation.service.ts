import api from './api'
import type { Evaluation, CreateEvaluationRequest } from '../types'

export const evaluationService = {
  getAll: async (): Promise<Evaluation[]> => {
    const response = await api.get<Evaluation[]>('/evaluations')
    return response.data
  },

  getById: async (id: string): Promise<Evaluation> => {
    const response = await api.get<Evaluation>(`/evaluations/${id}`)
    return response.data
  },

  create: async (data: CreateEvaluationRequest): Promise<Evaluation> => {
    const response = await api.post<Evaluation>('/evaluations', data)
    return response.data
  },
}
