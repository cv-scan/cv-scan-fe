import { useState } from "react";
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
import type { EvaluationStatus, Recommendation } from "../../types";

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

function RecommendationBadge({ rec }: { rec: Recommendation }) {
  const map: Record<
    Recommendation,
    {
      label: string;
      variant: "default" | "success" | "warning" | "danger" | "info";
    }
  > = {
    STRONG_YES: { label: "Strong Yes", variant: "success" },
    YES: { label: "Yes", variant: "success" },
    MAYBE: { label: "Maybe", variant: "warning" },
    NO: { label: "No", variant: "danger" },
    STRONG_NO: { label: "Strong No", variant: "danger" },
  };
  const { label, variant } = map[rec] || { label: rec, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function EvalListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedJD, setSelectedJD] = useState("");
  const [selectedCV, setSelectedCV] = useState("");

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ["evaluations"],
    queryFn: evaluationService.getAll,
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
    enabled: showModal,
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
  });

  const handleCreate = () => {
    if (selectedJD && selectedCV) {
      createMutation.mutate({ jobDescriptionId: selectedJD, cvId: selectedCV });
    }
  };

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
      ) : (
        <div className="grid gap-3">
          {evaluations.map((eval_) => (
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
                    {eval_.status === "completed" &&
                    eval_.overallScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        {eval_.recommendation && (
                          <RecommendationBadge rec={eval_.recommendation} />
                        )}
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-500">
                            {eval_.overallScore}%
                          </div>
                          <div className="text-xs text-gray-400">Score</div>
                        </div>
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

          {createMutation.error && (
            <p className="text-sm text-red-500">
              Failed to create evaluation. Please try again.
            </p>
          )}

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
