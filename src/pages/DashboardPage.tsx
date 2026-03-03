import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { jdService } from '../services/jd.service'
import { cvService } from '../services/cv.service'
import { evaluationService } from '../services/evaluation.service'
import { useAuthStore } from '../store/auth.store'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

function StatCard({ label, value, href, color }: { label: string; value: number; href: string; color: string }) {
  return (
    <Link to={href}>
      <Card className={`border-l-4 ${color} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()

  const { data: jds = [], isLoading: jdsLoading } = useQuery({
    queryKey: ['jds'],
    queryFn: jdService.getAll,
  })

  const { data: cvs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ['cvs'],
    queryFn: cvService.getAll,
  })

  const { data: evaluations = [], isLoading: evalsLoading } = useQuery({
    queryKey: ['evaluations'],
    queryFn: evaluationService.getAll,
  })

  const isLoading = jdsLoading || cvsLoading || evalsLoading
  const recentEvals = evaluations.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your CV scan activity.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Job Descriptions"
              value={jds.length}
              href="/jd"
              color="border-blue-500"
            />
            <StatCard
              label="CVs Uploaded"
              value={cvs.length}
              href="/cv"
              color="border-purple-500"
            />
            <StatCard
              label="Evaluations"
              value={evaluations.length}
              href="/evaluations"
              color="border-green-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Evaluations</h2>
                <Link to="/evaluations" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              {recentEvals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No evaluations yet.</p>
                  <Link to="/evaluations" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                    Create your first evaluation
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvals.map((eval_) => (
                    <Link
                      key={eval_.id}
                      to={`/evaluations/${eval_.id}`}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {eval_.jobDescription?.title || 'Untitled JD'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {eval_.cv?.fileName || 'Unknown CV'}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        {eval_.overallScore !== undefined ? (
                          <span className="text-sm font-bold text-blue-600">
                            {eval_.overallScore}%
                          </span>
                        ) : (
                          <Badge variant="warning">Processing</Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <Link
                  to="/jd/new"
                  className="flex items-center gap-3 p-3 rounded-md border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add Job Description</p>
                    <p className="text-xs text-gray-500">Create a new JD to evaluate CVs against</p>
                  </div>
                </Link>
                <Link
                  to="/cv/upload"
                  className="flex items-center gap-3 p-3 rounded-md border border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Upload CV</p>
                    <p className="text-xs text-gray-500">Upload a PDF or DOCX resume</p>
                  </div>
                </Link>
                <Link
                  to="/evaluations"
                  className="flex items-center gap-3 p-3 rounded-md border border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Evaluate CV</p>
                    <p className="text-xs text-gray-500">Score a CV against a job description</p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
