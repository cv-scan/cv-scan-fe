import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCVUpload } from '../../hooks/useCVUpload'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { cn } from '../../utils/cn'

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE_MB = 10

export function CVUploadPage() {
  const navigate = useNavigate()
  const { mutate: upload, isPending, progresses, isSuccess, data: uploadedCVs } = useCVUpload()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Only PDF and DOCX files are accepted.`
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `${file.name}: File size must be under ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  const handleFiles = (files: File[]) => {
    const errors: string[] = []
    const valid: File[] = []
    for (const file of files) {
      const error = validateFile(file)
      if (error) errors.push(error)
      else valid.push(file)
    }
    setFileErrors(errors)
    setSelectedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...valid.filter((f) => !existing.has(f.name))]
    })
  }

  const removeFile = (name: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name))
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      upload({ files: selectedFiles })
    }
  }

  if (isSuccess && uploadedCVs) {
    return (
      <div className="max-w-xl space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Upload Complete</h1>
        <Card className="text-center py-10">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {uploadedCVs.length === 1 ? 'Upload Successful!' : `${uploadedCVs.length} CVs Uploaded!`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {uploadedCVs.map((cv) => cv.fileName).join(', ')} {uploadedCVs.length === 1 ? 'is' : 'are'} being processed.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="secondary" onClick={() => navigate('/cv')}>
              View all CVs
            </Button>
            {uploadedCVs.length === 1 && (
              <Button onClick={() => navigate(`/cv/${uploadedCVs[0].id}`)}>
                View CV
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cv')}
          className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Upload CV</h1>
      </div>

      <Card>
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
            dragActive
              ? 'border-red-400 bg-red-50'
              : selectedFiles.length > 0
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="font-medium text-gray-900 text-sm">Drop your CVs here</p>
          <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
          <p className="text-xs text-gray-400 mt-2">PDF, DOCX up to {MAX_SIZE_MB}MB each — multiple files supported</p>
        </div>

        {fileErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {fileErrors.map((err) => (
              <p key={err} className="text-sm text-red-500">{err}</p>
            ))}
          </div>
        )}

        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {selectedFiles.map((file) => (
              <li key={file.name} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="flex-1 truncate text-sm text-gray-800">{file.name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {isPending ? (
                  <div className="w-16 shrink-0">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-300"
                        style={{ width: `${progresses[file.name] ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-0.5">{progresses[file.name] ?? 0}%</p>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.name) }}
                    className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3 mt-5">
          <Button variant="secondary" onClick={() => navigate('/cv')}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || fileErrors.length > 0}
            loading={isPending}
          >
            Upload {selectedFiles.length > 1 ? `${selectedFiles.length} CVs` : 'CV'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
