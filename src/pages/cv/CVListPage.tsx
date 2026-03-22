import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cvService } from '../../services/cv.service'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'
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

export function CVListPage() {
  const { data: cvs = [], isLoading, error } = useQuery({
    queryKey: ['cvs'],
    queryFn: cvService.getAll,
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CVs</h1>
          <p className="text-gray-500 mt-1 text-sm">{cvs.length} resumes uploaded</p>
        </div>
        <Link to="/cv/upload">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload CV
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="text-center py-8">
          <p className="text-red-500 text-sm">Failed to load CVs.</p>
        </Card>
      ) : cvs.length === 0 ? (
        <Card className="text-center py-16">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">No CVs uploaded yet.</p>
          <Link to="/cv/upload">
            <Button>Upload your first CV</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3">
          {cvs.map((cv) => (
            <Link key={cv.id} to={`/cv/${cv.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300" padding={false}>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{cv.fileName}</p>
                      {cv.parsedData?.name && (
                        <p className="text-xs text-gray-400 mt-0.5">{cv.parsedData.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={cv.status} />
                    <span className="text-xs text-gray-400">
                      {new Date(cv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
