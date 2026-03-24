import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jdService } from '../../services/jd.service'
import { evaluationService } from '../../services/evaluation.service'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'

export function JDListPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: jds = [], isLoading, error } = useQuery({
    queryKey: ['jds'],
    queryFn: jdService.getAll,
  })

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations'],
    queryFn: evaluationService.getAll,
  })

  const evalCountByJD = evaluations.reduce<Record<string, number>>((acc, ev) => {
    acc[ev.jobDescriptionId] = (acc[ev.jobDescriptionId] ?? 0) + 1
    return acc
  }, {})

  const deleteMutation = useMutation({
    mutationFn: jdService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jds'] })
      toast.success('Job description deleted successfully.')
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete job description. Please try again.')
      setDeleteId(null)
    },
  })

  const filtered = jds.filter(
    (jd) =>
      jd.title.toLowerCase().includes(search.toLowerCase()) ||
      jd.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Descriptions</h1>
          <p className="text-gray-500 mt-1 text-sm">{jds.length} job descriptions total</p>
        </div>
        <Link to="/jd/new">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New JD
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search job descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:border-gray-400 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="text-center py-8">
          <p className="text-red-500 text-sm">Failed to load job descriptions.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            {search ? 'No matching job descriptions.' : 'No job descriptions yet.'}
          </p>
          {!search && (
            <Link to="/jd/new">
              <Button>Create your first JD</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((jd) => {
            const count = evalCountByJD[jd.id] ?? 0
            return (
              <Card
                key={jd.id}
                className="hover:shadow-md transition-all duration-200 hover:border-gray-300"
                padding={false}
              >
                <div className="p-5 flex items-start gap-4">
                  <Link to={`/jd/${jd.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{jd.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{jd.description}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {count} CV{count !== 1 ? 's' : ''} evaluated
                        </span>
                        {jd.extractedSkills && jd.extractedSkills.length > 0 && (
                          <>
                            {jd.extractedSkills.slice(0, 5).map((skill) => (
                              <Badge key={skill} variant="info">{skill}</Badge>
                            ))}
                            {jd.extractedSkills.length > 5 && (
                              <Badge variant="default">+{jd.extractedSkills.length - 5} more</Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(jd.createdAt).toLocaleDateString()}
                    </div>
                  </Link>
                  <button
                    onClick={() => setDeleteId(jd.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 mt-0.5"
                    title="Delete JD"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Job Description"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this job description? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
