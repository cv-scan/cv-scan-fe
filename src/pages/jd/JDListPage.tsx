import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { jdService } from '../../services/jd.service'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'

export function JDListPage() {
  const [search, setSearch] = useState('')

  const { data: jds = [], isLoading, error } = useQuery({
    queryKey: ['jds'],
    queryFn: jdService.getAll,
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
          {filtered.map((jd) => (
            <Link key={jd.id} to={`/jd/${jd.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300" padding={false}>
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{jd.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{jd.description}</p>
                      {jd.extractedSkills && jd.extractedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {jd.extractedSkills.slice(0, 6).map((skill) => (
                            <Badge key={skill} variant="info">{skill}</Badge>
                          ))}
                          {jd.extractedSkills.length > 6 && (
                            <Badge variant="default">+{jd.extractedSkills.length - 6} more</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {new Date(jd.createdAt).toLocaleDateString()}
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
