import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { jdService } from '../../services/jd.service'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export function JDDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: jd, isLoading, error } = useQuery({
    queryKey: ['jd', id],
    queryFn: () => jdService.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !jd) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-500 text-sm">Failed to load job description.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/jd')}>
          Back to list
        </Button>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back + Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/jd')}
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">{jd.title}</h1>
        </div>
        <span className="text-xs text-gray-400">
          Created {new Date(jd.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Description */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Description</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{jd.description}</p>
      </Card>

      {/* Skills */}
      {jd.extractedSkills && jd.extractedSkills.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Extracted Skills</h2>
            <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">AI-identified</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {jd.extractedSkills.map((skill) => (
              <Badge key={skill} variant="info">{skill}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Action */}
      <div className="flex gap-3">
        <Button onClick={() => navigate('/evaluations')}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Evaluate a CV against this JD
        </Button>
      </div>
    </div>
  )
}
