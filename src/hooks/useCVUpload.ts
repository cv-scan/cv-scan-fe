import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cvService } from '../services/cv.service'
import type { CV } from '../types'

interface UploadPayload {
  files: File[]
}

export function useCVUpload() {
  const [progresses, setProgresses] = useState<Record<string, number>>({})
  const queryClient = useQueryClient()

  const mutation = useMutation<CV[], Error, UploadPayload>({
    mutationFn: ({ files }: UploadPayload) =>
      Promise.all(
        files.map((file) =>
          cvService.upload(file, undefined, undefined, (p) =>
            setProgresses((prev) => ({ ...prev, [file.name]: p }))
          )
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
      setProgresses({})
    },
    onError: () => {
      setProgresses({})
    },
  })

  return { ...mutation, progresses }
}
