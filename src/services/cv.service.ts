import api from "./api";
import type { CV, CVStatus, PaginatedResponse } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): CV {
  const rawStatus =
    (raw.parseStatus as string | undefined)?.toLowerCase() ?? "";
  const status: CVStatus =
    rawStatus === "completed" ? "parsed" : (rawStatus as CVStatus);

  return {
    id: raw.id,
    fileName: raw.fileName,
    fileUrl: raw.fileUrl ?? raw.viewUrl,
    viewUrl: raw.viewUrl ?? raw.fileUrl,
    status,
    parsedData:
      raw.candidateName || raw.candidateEmail
        ? {
            name: raw.candidateName ?? undefined,
            email: raw.candidateEmail ?? undefined,
          }
        : undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const cvService = {
  getAll: async (): Promise<CV[]> => {
    const response = await api.get<PaginatedResponse<unknown>>("/cvs");
    return response.data.data.map(normalize);
  },

  getById: async (id: string): Promise<CV> => {
    const response = await api.get<unknown>(`/cvs/${id}`);
    return normalize(response.data);
  },

  upload: async (
    file: File,
    candidateName?: string,
    candidateEmail?: string,
    onProgress?: (progress: number) => void,
  ): Promise<CV> => {
    const formData = new FormData();
    formData.append("file", file);

    const params: Record<string, string> = {};
    if (candidateName) params.candidateName = candidateName;
    if (candidateEmail) params.candidateEmail = candidateEmail;

    const response = await api.post<unknown>("/cvs", formData, {
      params,
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });
    return normalize(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cvs/${id}`);
  },
};
