import api from "./api";
import type {
  JobDescription,
  CreateJDRequest,
  PaginatedResponse,
  JDStats,
  Recommendation,
  ScoreCategory,
  Department,
  CreateDepartmentRequest,
  EmploymentType,
  ExperienceLevel,
  Classification,
} from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): JobDescription {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.content ?? "",
    requirements: "",
    extractedSkills: [
      ...(raw.requiredSkills ?? []),
      ...(raw.preferredSkills ?? []),
    ],
    department: raw.department ?? null,
    location: raw.location ?? null,
    employmentTypes: raw.employmentTypes ?? [],
    experienceLevel: raw.experienceLevel ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const jdService = {
  getAll: async (): Promise<JobDescription[]> => {
    const response =
      await api.get<PaginatedResponse<unknown>>("/job-descriptions");
    return response.data.data.map(normalize);
  },

  getById: async (id: string): Promise<JobDescription> => {
    const response = await api.get<unknown>(`/job-descriptions/${id}`);
    return normalize(response.data);
  },

  create: async (data: CreateJDRequest): Promise<JobDescription> => {
    const content = data.requirements
      ? `${data.description}\n\nRequirements:\n${data.requirements}`
      : data.description;
    const response = await api.post<unknown>("/job-descriptions", {
      title: data.title,
      content,
    });
    return normalize(response.data);
  },

  update: async (
    id: string,
    data: Partial<CreateJDRequest>,
  ): Promise<JobDescription> => {
    const payload: Record<string, string> = {};
    if (data.title) payload.title = data.title;
    if (data.description || data.requirements) {
      payload.content = data.requirements
        ? `${data.description ?? ""}\n\nRequirements:\n${data.requirements}`
        : (data.description ?? "");
    }
    const response = await api.put<unknown>(`/job-descriptions/${id}`, payload);
    return normalize(response.data);
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<PaginatedResponse<Department>>(
      "/departments",
      { params: { limit: 100 } },
    );
    return response.data.data;
  },

  createDepartment: async (
    data: CreateDepartmentRequest,
  ): Promise<Department> => {
    const response = await api.post<Department>("/departments", data);
    return response.data;
  },

  getEmploymentTypes: async (): Promise<EmploymentType[]> => {
    const response = await api.get<{ data: EmploymentType[] }>(
      "/job-descriptions/employment-types",
    );
    return response.data.data;
  },

  getExperienceLevels: async (): Promise<ExperienceLevel[]> => {
    const response = await api.get<{ data: ExperienceLevel[] }>(
      "/job-descriptions/experience-levels",
    );
    return response.data.data;
  },

  uploadFromFile: async (
    file: File,
    opts?: {
      title?: string;
      departmentId?: string;
      employmentTypes?: EmploymentType[];
      experienceLevel?: ExperienceLevel;
    },
  ): Promise<JobDescription> => {
    const formData = new FormData();
    formData.append("file", file);
    if (opts?.title) formData.append("title", opts.title);
    if (opts?.departmentId) formData.append("departmentId", opts.departmentId);
    if (opts?.experienceLevel)
      formData.append("experienceLevel", opts.experienceLevel);
    if (opts?.employmentTypes?.length) {
      opts.employmentTypes.forEach((et) =>
        formData.append("employmentTypes", et),
      );
    }
    const response = await api.post<unknown>(
      "/job-descriptions/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return normalize(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/job-descriptions/${id}`);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStats: async (id: string): Promise<JDStats> => {
    const response = await api.get<any>(`/job-descriptions/${id}/stats`);
    const raw = response.data;
    const toPercent = (v: number) => Math.round(v <= 1 ? v * 100 : v);
    const avgRaw = raw.averageScore ?? raw.avgScore ?? null;
    const classificationSource = raw.classificationBreakdown ??
      raw.classifications ?? {
        PASS: raw.pass,
        WAITLIST: raw.waitlist,
        FAIL: raw.fail,
      };

    const classificationBreakdown = Object.fromEntries(
      Object.entries(classificationSource)
        .filter(([, v]) => typeof v === "number")
        .map(([k, v]) => [k.toUpperCase() as Classification, v as number]),
    );

    return {
      totalEvaluations: raw.totalEvaluations ?? raw.total ?? 0,
      averageScore: avgRaw != null ? toPercent(avgRaw) : null,
      classificationBreakdown,
      recommendationBreakdown: Object.fromEntries(
        Object.entries(
          raw.recommendationBreakdown ?? raw.recommendations ?? {},
        ).map(([k, v]) => [k as Recommendation, v as number]),
      ),
      categoryAverages: Object.fromEntries(
        Object.entries(raw.categoryAverages ?? raw.categories ?? {}).map(
          ([k, v]) => [k as ScoreCategory, toPercent(v as number)],
        ),
      ),
    };
  },
};
