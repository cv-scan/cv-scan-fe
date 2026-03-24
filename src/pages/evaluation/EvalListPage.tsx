import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluationService } from "../../services/evaluation.service";
import { jdService } from "../../services/jd.service";
import { cvService } from "../../services/cv.service";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import type {
  Classification,
  EvaluationStatus,
  JobDescription,
} from "../../types";

function StatusBadge({ status }: { status: EvaluationStatus }) {
  const map: Record<
    EvaluationStatus,
    {
      label: string;
      variant: "default" | "success" | "warning" | "danger" | "info";
    }
  > = {
    pending: { label: "Pending", variant: "default" },
    processing: { label: "Processing", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    failed: { label: "Failed", variant: "danger" },
  };
  const { label, variant } = map[status] || map.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

function ClassificationBadge({
  classification,
}: {
  classification: Classification;
}) {
  const map: Record<
    Classification,
    {
      label: string;
      variant: "default" | "success" | "warning" | "danger" | "info";
    }
  > = {
    PASS: { label: "Pass", variant: "success" },
    WAITLIST: { label: "Waitlist", variant: "warning" },
    FAIL: { label: "Fail", variant: "danger" },
  };
  const { label, variant } = map[classification];
  return <Badge variant={variant}>{label}</Badge>;
}

function SearchableJDSelect({
  jds,
  value,
  onChange,
}: {
  jds: JobDescription[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = jds.find((jd) => jd.id === value);

  const filtered = jds.filter((jd) =>
    jd.title.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors min-w-[180px] max-w-[260px]"
      >
        <span className="flex-1 text-left truncate">
          {selected ? (
            selected.title
          ) : (
            <span className="text-gray-400">All JDs</span>
          )}
        </span>
        <svg
          className="h-4 w-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg
                className="h-4 w-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search JDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
                setSearch("");
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              All JDs
            </button>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">No results.</p>
            ) : (
              filtered.map((jd) => (
                <button
                  key={jd.id}
                  onClick={() => {
                    onChange(jd.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors truncate ${
                    jd.id === value
                      ? "font-medium text-red-600 bg-red-50"
                      : "text-gray-700"
                  }`}
                >
                  {jd.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CLASSIFICATION_OPTIONS: { value: Classification | ""; label: string }[] =
  [
    { value: "", label: "All Classifications" },
    { value: "PASS", label: "Pass" },
    { value: "WAITLIST", label: "Waitlist" },
    { value: "FAIL", label: "Fail" },
  ];

export function EvalListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedJD, setSelectedJD] = useState("");
  const [selectedCV, setSelectedCV] = useState("");
  const [filterClassification, setFilterClassification] = useState<
    Classification | ""
  >("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterJDId, setFilterJDId] = useState("");

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: [
      "evaluations",
      filterClassification,
      filterDepartmentId,
      filterJDId,
    ],
    queryFn: () =>
      evaluationService.getAll({
        classification: filterClassification || undefined,
        departmentId: filterDepartmentId || undefined,
        jobDescriptionId: filterJDId || undefined,
      }),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasProcessing =
        Array.isArray(data) &&
        data.some((e) => e.status === "pending" || e.status === "processing");
      return hasProcessing ? 3000 : false;
    },
  });

  const { data: jds = [] } = useQuery({
    queryKey: ["jds"],
    queryFn: jdService.getAll,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: jdService.getDepartments,
  });

  const { data: cvs = [] } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvService.getAll,
    enabled: showModal,
  });

  const createMutation = useMutation({
    mutationFn: evaluationService.create,
    onSuccess: (eval_) => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      setShowModal(false);
      navigate(`/evaluations/${eval_.id}`);
    },
    onError: () => {
      toast.error("Failed to create evaluation. Please try again.");
    },
  });

  const handleCreate = () => {
    if (selectedJD && selectedCV) {
      createMutation.mutate({ jobDescriptionId: selectedJD, cvId: selectedCV });
    }
  };

  const filtered = evaluations;

  const hasFilters =
    filterClassification !== "" ||
    filterDepartmentId !== "" ||
    filterJDId !== "";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {evaluations.length} evaluations total
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg
            className="h-4 w-4"
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
          New Evaluation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterClassification}
          onChange={(e) =>
            setFilterClassification(e.target.value as Classification | "")
          }
          className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:border-gray-400 transition-colors"
        >
          {CLASSIFICATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filterDepartmentId}
          onChange={(e) => setFilterDepartmentId(e.target.value)}
          className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:border-gray-400 transition-colors"
        >
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>

        <SearchableJDSelect
          jds={jds}
          value={filterJDId}
          onChange={setFilterJDId}
        />

        {hasFilters && (
          <button
            onClick={() => {
              setFilterClassification("");
              setFilterDepartmentId("");
              setFilterJDId("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}

        {hasFilters && (
          <span className="text-sm text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : evaluations.length === 0 ? (
        <Card className="text-center py-16">
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
          <p className="text-gray-500 text-sm mb-4">No evaluations yet.</p>
          <Button onClick={() => setShowModal(true)}>Evaluate a CV</Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-gray-500 text-sm">
            No evaluations match the current filters.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((eval_) => (
            <Link key={eval_.id} to={`/evaluations/${eval_.id}`}>
              <Card
                className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300"
                padding={false}
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {eval_.jdTitle ||
                          eval_.jobDescription?.title ||
                          `JD #${eval_.jobDescriptionId.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {eval_.candidateName ||
                          eval_.cv?.parsedData?.name ||
                          eval_.cv?.fileName ||
                          `CV #${eval_.cvId.slice(0, 8)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {eval_.classification && (
                      <ClassificationBadge
                        classification={eval_.classification as Classification}
                      />
                    )}
                    {/* {eval_.recommendation && (
                      <RecommendationBadge rec={eval_.recommendation} />
                    )} */}
                    {eval_.status === "completed" &&
                    eval_.overallScore !== undefined ? (
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-500">
                          {eval_.overallScore}%
                        </div>
                        {/* <div className="text-xs text-gray-400">Score</div> */}
                      </div>
                    ) : (
                      <StatusBadge status={eval_.status} />
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(eval_.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Evaluation"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Description
            </label>
            <select
              value={selectedJD}
              onChange={(e) => setSelectedJD(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:border-gray-400 transition-colors"
            >
              <option value="">Select a job description...</option>
              {jds.length === 0 ? (
                <option disabled>No job descriptions — create one first</option>
              ) : (
                jds.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CV
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
                    {cv.parsedData?.name
                      ? `${cv.parsedData.name} — ${cv.fileName}`
                      : cv.fileName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedJD || !selectedCV}
              loading={createMutation.isPending}
            >
              Start Evaluation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
