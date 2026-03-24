import api from "./api";
import type {
  Evaluation,
  CreateEvaluationRequest,
  PaginatedResponse,
  EvaluationStatus,
  ScoreCategory,
  Recommendation,
} from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): Evaluation {
  return {
    id: raw.id,
    cvId: raw.cvId,
    jobDescriptionId: raw.jobDescriptionId,
    candidateName: raw.candidateName,
    jdTitle: raw.jdTitle,
    status: (raw.status as string).toLowerCase() as EvaluationStatus,
    overallScore:
      raw.overallScore != null ? Math.round(raw.overallScore * 100) : undefined,
    classification: raw.classification,
    recommendation: raw.recommendation as Recommendation | undefined,
    errorMessage: raw.errorMessage,
    categoryScores: raw.scores?.map(
      (s: {
        category: string;
        rawScore: number;
        rationale: string;
        evidence: string[];
        gaps: string[];
      }) => ({
        category: s.category as ScoreCategory,
        score: Math.round(s.rawScore * 100),
        maxScore: 100,
        feedback: [
          s.rationale,
          s.evidence.length ? `Evidence: ${s.evidence.join(", ")}` : "",
          s.gaps.length ? `Gaps: ${s.gaps.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(". "),
      }),
    ),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const evaluationService = {
  getAll: async (): Promise<Evaluation[]> => {
    const response = await api.get<PaginatedResponse<unknown>>("/evaluations");
    return response.data.data.map(normalize);
  },

  getById: async (id: string): Promise<Evaluation> => {
    const response = await api.get<unknown>(`/evaluations/${id}`);
    return normalize(response.data);
  },

  create: async (data: CreateEvaluationRequest): Promise<Evaluation> => {
    const response = await api.post<unknown>("/evaluations", data);
    return normalize(response.data);
  },
};
