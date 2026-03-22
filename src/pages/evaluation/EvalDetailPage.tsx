import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { evaluationService } from '../../services/evaluation.service'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ScoreCard } from '../../components/evaluation/ScoreCard'
import { ScoreBar } from '../../components/evaluation/ScoreBar'
import type { EvaluationStatus, ScoreCategory, Recommendation } from '../../types'

function RecommendationBadge({ rec }: { rec: Recommendation }) {
  const map: Record<Recommendation, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
    STRONG_YES: { label: 'Strong Yes', variant: 'success' },
    YES: { label: 'Yes', variant: 'success' },
    MAYBE: { label: 'Maybe', variant: 'warning' },
    NO: { label: 'No', variant: 'danger' },
    STRONG_NO: { label: 'Strong No', variant: 'danger' },
  }
  const { label, variant } = map[rec] || { label: rec, variant: 'default' }
  return <Badge variant={variant}>{label}</Badge>
}

const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  SKILLS: 'Skills Match',
  EXPERIENCE: 'Experience',
  EDUCATION: 'Education',
  ACHIEVEMENTS: 'Achievements',
  RELEVANCE: 'Overall Relevance',
}

function StatusBadge({ status }: { status: EvaluationStatus }) {
  const map: Record<EvaluationStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
    pending: { label: 'Pending', variant: 'default' },
    processing: { label: 'Processing...', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    failed: { label: 'Failed', variant: 'danger' },
  }
  const { label, variant } = map[status] || map.pending
  return <Badge variant={variant}>{label}</Badge>
}

export function EvalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: evaluation, isLoading, error } = useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => evaluationService.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'pending' || data?.status === 'processing') return 3000
      return false
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-500 text-sm">Failed to load evaluation.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/evaluations')}>
          Back to list
        </Button>
      </Card>
    )
  }

  const isProcessing = evaluation.status === 'pending' || evaluation.status === 'processing'

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/evaluations')}
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Evaluation Result</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={evaluation.status} />
          {evaluation.recommendation && <RecommendationBadge rec={evaluation.recommendation} />}
          <span className="text-xs text-gray-400 ml-1">
            {new Date(evaluation.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* JD + CV info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card padding={false}>
          <div className="p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Job Description</h3>
            <p className="font-semibold text-gray-900 text-sm">
              {evaluation.jobDescription?.title || `JD #${evaluation.jobDescriptionId.slice(0, 8)}`}
            </p>
          </div>
        </Card>
        <Card padding={false}>
          <div className="p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">CV</h3>
            <p className="font-semibold text-gray-900 text-sm">
              {evaluation.cv?.fileName || `CV #${evaluation.cvId.slice(0, 8)}`}
            </p>
          </div>
        </Card>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <Card className="border-red-100 bg-red-50" padding={false}>
          <div className="p-5 flex items-center gap-4">
            <Spinner size="md" className="text-red-500" />
            <div>
              <p className="font-semibold text-red-900 text-sm">AI is evaluating the CV...</p>
              <p className="text-sm text-red-500 mt-0.5">Results will appear shortly. Page auto-refreshes.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Scores */}
      {evaluation.status === 'completed' && evaluation.overallScore !== undefined && (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreCard score={evaluation.overallScore} label="Overall Score" />
              <div className="flex-1 w-full">
                {evaluation.categoryScores && evaluation.categoryScores.length > 0 ? (
                  <div className="space-y-4">
                    {evaluation.categoryScores.map((cat) => (
                      <ScoreBar
                        key={cat.category}
                        label={CATEGORY_LABELS[cat.category] || cat.category}
                        score={cat.score}
                        maxScore={cat.maxScore}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No detailed breakdown available.</p>
                )}
              </div>
            </div>
          </Card>

          {/* AI Summary */}
          {evaluation.summary && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Summary</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{evaluation.summary}</p>
            </Card>
          )}

          {/* Recommendations */}
          {evaluation.recommendations && evaluation.recommendations.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recommendations</h2>
              <ul className="space-y-2.5">
                {evaluation.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Category Feedback */}
          {evaluation.categoryScores && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Category Feedback</h2>
              <div className="space-y-4">
                {evaluation.categoryScores.map((cat) => cat.feedback && (
                  <div key={cat.category} className="border-l-2 border-red-200 pl-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {CATEGORY_LABELS[cat.category]}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{cat.feedback}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Failed state */}
      {evaluation.status === 'failed' && (
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-700 leading-relaxed">
            {evaluation.errorMessage || 'Evaluation failed. This may be due to an unreadable CV or a processing error. Please try again.'}
          </p>
        </Card>
      )}
    </div>
  )
}
