import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { jdService } from "../services/jd.service";
import { cvService } from "../services/cv.service";
import { evaluationService } from "../services/evaluation.service";
import { useAuthStore } from "../store/auth.store";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, href, icon, color }: StatCardProps) {
  return (
    <Link to={href}>
      <Card
        className="hover:shadow-md transition-all duration-200 cursor-pointer group"
        padding={false}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div
              className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              {icon}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: jds = [], isLoading: jdsLoading } = useQuery({
    queryKey: ["jds"],
    queryFn: jdService.getAll,
  });

  const { data: cvs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvService.getAll,
  });

  const { data: evaluations = [], isLoading: evalsLoading } = useQuery({
    queryKey: ["evaluations"],
    queryFn: evaluationService.getAll,
  });

  const isLoading = jdsLoading || cvsLoading || evalsLoading;
  const recentEvals = evaluations.slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's an overview of your CV scan activity.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Job Descriptions"
              value={jds.length}
              href="/jd"
              color="bg-red-50"
              icon={
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <StatCard
              label="CVs Uploaded"
              value={cvs.length}
              href="/cv"
              color="bg-violet-50"
              icon={
                <svg
                  className="h-5 w-5 text-violet-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />
            <StatCard
              label="Evaluations"
              value={evaluations.length}
              href="/evaluations"
              color="bg-emerald-50"
              icon={
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Evaluations */}
            <Card padding={false}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                  Recent Evaluations
                </h2>
                <Link
                  to="/evaluations"
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  View all
                </Link>
              </div>
              {recentEvals.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No evaluations yet.</p>
                  <Link
                    to="/evaluations"
                    className="text-red-500 text-sm hover:text-red-600 font-medium mt-1 inline-block"
                  >
                    Create your first evaluation
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentEvals.map((eval_) => (
                    <Link
                      key={eval_.id}
                      to={`/evaluations/${eval_.id}`}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {eval_.jdTitle || "Untitled JD"}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {eval_.candidateName || "Unknown CV"}
                        </p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        {eval_.overallScore !== undefined ? (
                          <span className="text-sm font-bold text-red-500">
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

            {/* Quick Actions */}
            <Card padding={false}>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  to="/jd/new"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Add Job Description
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Create a new JD to evaluate CVs against
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-300 ml-auto group-hover:text-red-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  to="/cv/upload"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 transition-colors">
                    <svg
                      className="h-5 w-5 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Upload CV
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload a PDF or DOCX resume
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-300 ml-auto group-hover:text-violet-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  to="/evaluations"
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <svg
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Evaluate CV
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Score a CV against a job description
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-300 ml-auto group-hover:text-emerald-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
