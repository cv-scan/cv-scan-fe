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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Descriptions</h1>
          <p className="text-gray-500 mt-1">{jds.length} job descriptions total</p>
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

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search job descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="text-center py-8">
          <p className="text-red-500">Failed to load job descriptions.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-3">
            {search ? 'No matching job descriptions.' : 'No job descriptions yet.'}
          </p>
          {!search && (
            <Link to="/jd/new">
              <Button variant="secondary">Create your first JD</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((jd) => (
            <Link key={jd.id} to={`/jd/${jd.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900">{jd.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{jd.description}</p>
                    {jd.extractedSkills && jd.extractedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {jd.extractedSkills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="info">{skill}</Badge>
                        ))}
                        {jd.extractedSkills.length > 6 && (
                          <Badge variant="default">+{jd.extractedSkills.length - 6}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-xs text-gray-400 whitespace-nowrap">
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
