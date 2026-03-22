import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jdService } from '../../services/jd.service'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Card } from '../../components/ui/Card'

const jdSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
})

type JDFormData = z.infer<typeof jdSchema>

export function JDCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JDFormData>({
    resolver: zodResolver(jdSchema),
  })

  const createMutation = useMutation({
    mutationFn: jdService.create,
    onSuccess: (jd) => {
      queryClient.invalidateQueries({ queryKey: ['jds'] })
      navigate(`/jd/${jd.id}`)
    },
  })

  const onSubmit = (data: JDFormData) => {
    createMutation.mutate(data)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/jd')}
          className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Job Description</h1>
      </div>

      <Card>
        {createMutation.error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg flex gap-2.5">
            <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-500">Failed to create job description. Please try again.</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Frontend Engineer"
            error={errors.title?.message}
            {...register('title')}
          />

          <Textarea
            label="Job Description"
            placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
            rows={5}
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Requirements"
            placeholder="List the required skills, qualifications, and experience..."
            rows={5}
            error={errors.requirements?.message}
            {...register('requirements')}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/jd')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending}
            >
              Create Job Description
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
