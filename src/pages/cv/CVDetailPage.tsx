import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cvService } from "../../services/cv.service";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Modal } from "../../components/ui/Modal";
import type { CVStatus } from "../../types";

function StatusBadge({ status }: { status: CVStatus }) {
  const map: Record<
    CVStatus,
    {
      label: string;
      variant: "default" | "success" | "warning" | "danger" | "info";
    }
  > = {
    pending: { label: "Pending", variant: "default" },
    processing: { label: "Processing", variant: "warning" },
    parsed: { label: "Parsed", variant: "success" },
    failed: { label: "Failed", variant: "danger" },
  };
  const { label, variant } = map[status] || map.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

export function CVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const {
    data: cv,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cv", id],
    queryFn: () => cvService.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "processing" || data?.status === "pending")
        return 3000;
      return false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-500 text-sm">Failed to load CV.</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate("/cv")}
        >
          Back to list
        </Button>
      </Card>
    );
  }

  const parsed = cv.parsedData;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cv")}
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {cv.fileName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {cv.viewUrl && (
            <Button variant="secondary" onClick={() => setIsViewerOpen(true)}>
              View CV
            </Button>
          )}
          <StatusBadge status={cv.status} />
          <span className="text-xs text-gray-400">
            {new Date(cv.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Processing notice */}
      {(cv.status === "pending" || cv.status === "processing") && (
        <Card
          className="flex items-center gap-3 bg-amber-50 border-amber-200"
          padding={false}
        >
          <div className="p-4 flex items-center gap-3">
            <Spinner size="sm" className="text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Processing your CV
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                This may take a moment. Page will auto-refresh.
              </p>
            </div>
          </div>
        </Card>
      )}

      {parsed && (
        <>
          {/* Contact */}
          {(parsed.name || parsed.email || parsed.phone) && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Contact Information
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {parsed.name && (
                  <div>
                    <dt className="text-xs text-gray-400 mb-1">Name</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {parsed.name}
                    </dd>
                  </div>
                )}
                {parsed.email && (
                  <div>
                    <dt className="text-xs text-gray-400 mb-1">Email</dt>
                    <dd className="text-sm text-gray-700">{parsed.email}</dd>
                  </div>
                )}
                {parsed.phone && (
                  <div>
                    <dt className="text-xs text-gray-400 mb-1">Phone</dt>
                    <dd className="text-sm text-gray-700">{parsed.phone}</dd>
                  </div>
                )}
              </dl>
            </Card>
          )}

          {/* Summary */}
          {parsed.summary && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Summary
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {parsed.summary}
              </p>
            </Card>
          )}

          {/* Skills */}
          {parsed.skills && parsed.skills.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.map((skill) => (
                  <Badge key={skill} variant="purple">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Experience */}
          {parsed.experience && parsed.experience.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Experience
              </h2>
              <div className="space-y-5">
                {parsed.experience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-red-200 pl-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {exp.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {exp.company}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Education */}
          {parsed.education && parsed.education.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Education
              </h2>
              <div className="space-y-4">
                {parsed.education.map((edu, i) => (
                  <div key={i} className="border-l-2 border-violet-200 pl-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {edu.institution}
                    </p>
                    {edu.graduationYear && (
                      <p className="text-xs text-gray-400 mt-1">
                        {edu.graduationYear}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {cv.status === "parsed" && !parsed && (
        <Card className="text-center py-6">
          <p className="text-sm text-gray-500">No parsed data available.</p>
        </Card>
      )}

      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title="CV Preview"
        size="xl"
      >
        {cv.viewUrl ? (
          <div className="space-y-3">
            <iframe
              src={cv.viewUrl}
              title="CV Preview"
              className="w-full h-[70vh] rounded-lg border border-gray-200"
            />
            <div className="flex justify-end">
              <a
                href={cv.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                Open in new tab
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Preview URL is not available for this CV.
          </p>
        )}
      </Modal>
    </div>
  );
}
