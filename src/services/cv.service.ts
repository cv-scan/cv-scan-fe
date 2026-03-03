import api from './api'
import type { CV } from '../types'

export const cvService = {
  getAll: async (): Promise<CV[]> => {
    const response = await api.get<CV[]>('/cvs')
    return response.data
  },

  getById: async (id: string): Promise<CV> => {
    const response = await api.get<CV>(`/cvs/${id}`)
    return response.data
  },

  upload: async (file: File, onProgress?: (progress: number) => void): Promise<CV> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<CV>('/cvs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cvs/${id}`)
  },
}
