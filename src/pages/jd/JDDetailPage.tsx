import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jdService } from '../../services/jd.service'
import { cvService } from '../../services/cv.service'
import { evaluationService } from '../../services/evaluation.service'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../utils/cn'
import type { Recommendation, ScoreCategory } from '../../types'

type Tab = 'overview' | 'stats'

const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  STRONG_YES: 'Strong Yes',
  YES: 'Yes',
  MAYBE: 'Maybe',
  NO: 'No',
  STRONG_NO: 'Strong No',
}

const RECOMMENDATION_COLORS: Record<Recommendation, string> = {
  STRONG_YES: 'bg-green-500',
  YES: 'bg-green-400',
  MAYBE: 'bg-yellow-400',
  NO: 'bg-red-400',
  STRONG_NO: 'bg-red-600',
}

const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  SKILLS: 'Skills',
  EXPERIENCE: 'Experience',
  EDUCATION: 'Education',
  ACHIEVEMENTS: 'Achievements',
  RELEVANCE: 'Relevance',
}

export function JDDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [selectedCV, setSelectedCV] = useState('')

  const { data: jd, isLoading, error } = useQuery({
    queryKey: ['jd', id],
    queryFn: () => jdService.getById(id!),
    enabled: !!id,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['jd-stats', id],
    queryFn: () => jdService.getStats(id!),
    enabled: !!id && activeTab === 'stats',
  })

  const { data: cvs = [] } = useQuery({
    queryKey: ['cvs'],
    queryFn: cvService.getAll,
    enabled: showEvalModal,
  })

  const createMutation = useMutation({
    mutationFn: evaluationService.create,
    onSuccess: (eval_) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['jd-stats', id] })
      setShowEvalModal(false)
      navigate(`/evaluations/${eval_.id}`)
    },
    onError: () => {
      toast.error('Failed to create evaluation. Please try again.')
    },
  })

  const handleEvaluate = () => {
    if (id && selectedCV) {
      createMutation.mutate({ jobDescriptionId: id, cvId: selectedCV })
    }
  }

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
      {/* Header */}
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Created {new Date(jd.createdAt).toLocaleDateString()}
          </span>
          <Button size="sm" onClick={() => { setSelectedCV(''); setShowEvalModal(true) }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Evaluate a CV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'stats'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'text-red-600 border-red-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            {tab === 'overview' ? 'Overview' : 'Stats'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Description</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{jd.description}</p>
          </Card>

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
        </>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <>
          {statsLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : !stats ? (
            <Card className="text-center py-10">
              <p className="text-gray-400 text-sm">Failed to load stats.</p>
            </Card>
          ) : stats.totalEvaluations === 0 ? (
            <Card className="text-center py-16">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-4">No evaluations yet for this JD.</p>
              <Button size="sm" onClick={() => { setSelectedCV(''); setShowEvalModal(true) }}>
                Evaluate a CV
              </Button>
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Total Evaluations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvaluations}</p>
                </Card>
                <Card>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-red-500">
                    {stats.averageScore != null ? `${stats.averageScore}%` : '—'}
                  </p>
                </Card>
              </div>

              {/* Recommendation Breakdown */}
              {Object.keys(stats.recommendationBreakdown).length > 0 && (
                <Card>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recommendation Breakdown</h2>
                  <div className="space-y-3">
                    {(Object.entries(stats.recommendationBreakdown) as [Recommendation, number][]).map(([rec, count]) => {
                      const pct = Math.round((count / stats.totalEvaluations) * 100)
                      return (
                        <div key={rec}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{RECOMMENDATION_LABELS[rec] ?? rec}</span>
                            <span className="text-gray-500">{count} <span className="text-gray-400">({pct}%)</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', RECOMMENDATION_COLORS[rec] ?? 'bg-gray-400')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* Category Averages */}
              {Object.keys(stats.categoryAverages).length > 0 && (
                <Card>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Category Averages</h2>
                  <div className="space-y-3">
                    {(Object.entries(stats.categoryAverages) as [ScoreCategory, number][]).map(([cat, score]) => (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{CATEGORY_LABELS[cat] ?? cat}</span>
                          <span className="font-semibold text-gray-900">{score}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-400 transition-all"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {/* Evaluate CV Modal */}
      <Modal
        isOpen={showEvalModal}
        onClose={() => setShowEvalModal(false)}
        title="Evaluate a CV"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 mb-0.5">Job Description</p>
            <p className="text-sm font-medium text-gray-900 truncate">{jd.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select CV
            </label>
            <select
              value={selectedCV}
              onChange={(e) => setSelectedCV(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:border-gray-400 transition-colors"
            >
              <option value="">Select a CV...</option>
              {cvs.length === 0 ? (
                <option disabled>No CVs — upload one first</option>
              ) : (
                cvs.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.parsedData?.name ? `${cv.parsedData.name} — ${cv.fileName}` : cv.fileName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowEvalModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEvaluate}
              disabled={!selectedCV}
              loading={createMutation.isPending}
            >
              Start Evaluation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
