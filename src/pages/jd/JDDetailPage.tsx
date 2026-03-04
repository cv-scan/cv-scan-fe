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
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !jd) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-500">Failed to load job description.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/jd')}>
          Back to list
        </Button>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/jd')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{jd.title}</h1>
        </div>
        <div className="text-xs text-gray-400">
          Created {new Date(jd.createdAt).toLocaleDateString()}
        </div>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Job Description</h2>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{jd.description}</p>
      </Card>

      {jd.extractedSkills && jd.extractedSkills.length > 0 && (
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Extracted Skills
            <span className="ml-2 text-xs text-gray-400 font-normal">AI-identified skills</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {jd.extractedSkills.map((skill) => (
              <Badge key={skill} variant="info">{skill}</Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => navigate('/evaluations')}
          variant="primary"
        >
          Evaluate a CV against this JD
        </Button>
      </div>
    </div>
  )
}
