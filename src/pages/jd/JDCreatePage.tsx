import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
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
import { cn } from '../../utils/cn'

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE_MB = 10

const jdSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
})

type JDFormData = z.infer<typeof jdSchema>
type Mode = 'upload' | 'manual'

export function JDCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('upload')

  // Upload state
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<JDFormData>({
    resolver: zodResolver(jdSchema),
  })

  const onSuccess = (jd: { id: string }) => {
    queryClient.invalidateQueries({ queryKey: ['jds'] })
    navigate(`/jd/${jd.id}`)
  }

  const createMutation = useMutation({
    mutationFn: jdService.create,
    onSuccess,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      jdService.uploadFromFile(file, title),
    onSuccess,
  })

  const isPending = createMutation.isPending || uploadMutation.isPending
  const mutationError = createMutation.error || uploadMutation.error

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Only PDF and DOCX files are accepted.'
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File size must be under ${MAX_SIZE_MB}MB.`
    return null
  }

  const handleFile = (file: File) => {
    const error = validateFile(file)
    if (error) { setFileError(error); setSelectedFile(null) }
    else { setFileError(null); setSelectedFile(file) }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({ file: selectedFile, title: uploadTitle.trim() || undefined })
    }
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

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(['upload', 'manual'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              mode === m
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {m === 'upload' ? 'Upload File' : 'Fill Manually'}
          </button>
        ))}
      </div>

      <Card>
        {mutationError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg flex gap-2.5">
            <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-500">Failed to create job description. Please try again.</p>
          </div>
        )}

        {mode === 'upload' ? (
          <div className="space-y-5">
            <Input
              label="Job Title (optional)"
              placeholder="Auto-extracted from file if left empty"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
                dragActive
                  ? 'border-red-400 bg-red-50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleInputChange}
              />
              {selectedFile ? (
                <div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-xs text-red-500 mt-2 font-medium">Click to change file</p>
                </div>
              ) : (
                <div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">Drop your JD file here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-2">PDF, DOCX up to {MAX_SIZE_MB}MB — metadata auto-extracted</p>
                </div>
              )}
            </div>

            {fileError && <p className="text-sm text-red-500">{fileError}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={() => navigate('/jd')}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !!fileError}
                loading={isPending}
              >
                Upload & Create
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-5">
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
              <Button type="button" variant="secondary" onClick={() => navigate('/jd')}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                Create Job Description
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
