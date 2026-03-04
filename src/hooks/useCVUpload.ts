import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cvService } from '../services/cv.service'

interface UploadPayload {
  file: File
  candidateName?: string
  candidateEmail?: string
}

export function useCVUpload() {
  const [progress, setProgress] = useState(0)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ file, candidateName, candidateEmail }: UploadPayload) =>
      cvService.upload(file, candidateName, candidateEmail, setProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
      setProgress(0)
    },
    onError: () => {
      setProgress(0)
    },
  })

  return { ...mutation, progress }
}
