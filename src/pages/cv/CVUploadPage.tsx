import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCVUpload } from '../../hooks/useCVUpload'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { cn } from '../../utils/cn'

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_SIZE_MB = 10

export function CVUploadPage() {
  const navigate = useNavigate()
  const { mutate: upload, isPending, progress, isSuccess, data: uploadedCV } = useCVUpload()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are accepted.'
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size must be under ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  const handleFile = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
    } else {
      setFileError(null)
      setSelectedFile(file)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleUpload = () => {
    if (selectedFile) {
      upload({
        file: selectedFile,
        candidateName: candidateName.trim() || undefined,
        candidateEmail: candidateEmail.trim() || undefined,
      })
    }
  }

  if (isSuccess && uploadedCV) {
    return (
      <div className="max-w-xl space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Upload Complete</h1>
        <Card className="text-center py-10">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Upload Successful!</h2>
          <p className="text-sm text-gray-500 mt-1">{uploadedCV.fileName} is being processed.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="secondary" onClick={() => navigate('/cv')}>
              View all CVs
            </Button>
            <Button onClick={() => navigate(`/cv/${uploadedCV.id}`)}>
              View CV
            </Button>
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
        <div className="space-y-4 mb-5">
          <Input
            label="Candidate Name"
            placeholder="e.g. Nguyen Van A"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          <Input
            label="Candidate Email"
            type="email"
            placeholder="e.g. candidate@email.com"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
          />
        </div>

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
              <p className="text-xs text-gray-400 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-red-500 mt-2 font-medium">Click to change file</p>
            </div>
          ) : (
            <div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="font-medium text-gray-900 text-sm">Drop your CV here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-2">PDF, DOCX up to {MAX_SIZE_MB}MB</p>
            </div>
          )}
        </div>

        {fileError && (
          <p className="text-sm text-red-500 mt-2">{fileError}</p>
        )}

        {/* Upload progress */}
        {isPending && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Uploading...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <Button
            variant="secondary"
            onClick={() => navigate('/cv')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !!fileError}
            loading={isPending}
          >
            Upload CV
          </Button>
        </div>
      </Card>
    </div>
  )
}
