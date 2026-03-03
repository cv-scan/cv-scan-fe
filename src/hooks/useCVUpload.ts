import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cvService } from '../services/cv.service'

export function useCVUpload() {
  const [progress, setProgress] = useState(0)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (file: File) => cvService.upload(file, setProgress),
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
