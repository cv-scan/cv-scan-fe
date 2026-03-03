import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cvService } from '../../services/cv.service'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import type { CVStatus } from '../../types'

function StatusBadge({ status }: { status: CVStatus }) {
  const map: Record<CVStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
    pending: { label: 'Pending', variant: 'default' },
    processing: { label: 'Processing', variant: 'warning' },
    parsed: { label: 'Parsed', variant: 'success' },
    failed: { label: 'Failed', variant: 'danger' },
  }
  const { label, variant } = map[status] || map.pending
  return <Badge variant={variant}>{label}</Badge>
}

export function CVDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: cv, isLoading, error } = useQuery({
    queryKey: ['cv', id],
    queryFn: () => cvService.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'processing' || data?.status === 'pending') return 3000
      return false
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !cv) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-500">Failed to load CV.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/cv')}>
          Back to list
        </Button>
      </Card>
    )
  }

  const parsed = cv.parsedData

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cv')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate">{cv.fileName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={cv.status} />
          <span className="text-xs text-gray-400">
            {new Date(cv.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {(cv.status === 'pending' || cv.status === 'processing') && (
        <Card className="flex items-center gap-3 bg-yellow-50 border-yellow-200">
          <Spinner size="sm" className="text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Processing your CV</p>
            <p className="text-xs text-yellow-600">This may take a moment. Page will auto-refresh.</p>
          </div>
        </Card>
      )}

      {parsed && (
        <>
          {(parsed.name || parsed.email || parsed.phone) && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Contact Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {parsed.name && (
                  <div>
                    <dt className="text-xs text-gray-500">Name</dt>
                    <dd className="text-sm font-medium text-gray-900">{parsed.name}</dd>
                  </div>
                )}
                {parsed.email && (
                  <div>
                    <dt className="text-xs text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{parsed.email}</dd>
                  </div>
                )}
                {parsed.phone && (
                  <div>
                    <dt className="text-xs text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{parsed.phone}</dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {parsed.summary && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Summary</h2>
              <p className="text-sm text-gray-700">{parsed.summary}</p>
            </Card>
          )}

          {parsed.skills && parsed.skills.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.map((skill) => (
                  <Badge key={skill} variant="purple">{skill}</Badge>
                ))}
              </div>
            </Card>
          )}

          {parsed.experience && parsed.experience.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Experience</h2>
              <div className="space-y-4">
                {parsed.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-blue-200 pl-3">
                    <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-400">
                      {exp.startDate} – {exp.endDate || 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {parsed.education && parsed.education.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Education</h2>
              <div className="space-y-3">
                {parsed.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-purple-200 pl-3">
                    <p className="text-sm font-medium text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    {edu.graduationYear && (
                      <p className="text-xs text-gray-400">{edu.graduationYear}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {cv.status === 'parsed' && !parsed && (
        <Card className="text-center py-6">
          <p className="text-sm text-gray-500">No parsed data available.</p>
        </Card>
      )}
    </div>
  )
}
