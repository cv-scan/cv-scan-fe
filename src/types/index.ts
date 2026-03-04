// Auth
export interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// Job Description
export interface JobDescription {
  id: string
  title: string
  description: string
  requirements: string
  extractedSkills?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateJDRequest {
  title: string
  description: string
  requirements: string
}

// CV
export type CVStatus = 'pending' | 'processing' | 'parsed' | 'failed'

export interface CV {
  id: string
  fileName: string
  fileUrl?: string
  status: CVStatus
  parsedData?: CVParsedData
  createdAt: string
  updatedAt: string
}

export interface CVParsedData {
  name?: string
  email?: string
  phone?: string
  skills?: string[]
  experience?: ExperienceItem[]
  education?: EducationItem[]
  summary?: string
}

export interface ExperienceItem {
  company: string
  title: string
  startDate: string
  endDate?: string
  description?: string
}

export interface EducationItem {
  institution: string
  degree: string
  field?: string
  graduationYear?: string
}

// Evaluation
export type EvaluationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type ScoreCategory = 'SKILLS' | 'EXPERIENCE' | 'EDUCATION' | 'ACHIEVEMENTS' | 'RELEVANCE'

export interface CategoryScore {
  category: ScoreCategory
  score: number
  maxScore: number
  feedback?: string
}

export interface Evaluation {
  id: string
  jobDescriptionId: string
  cvId: string
  status: EvaluationStatus
  overallScore?: number
  categoryScores?: CategoryScore[]
  summary?: string
  recommendations?: string[]
  jobDescription?: JobDescription
  cv?: CV
  createdAt: string
  updatedAt: string
}

export interface CreateEvaluationRequest {
  jobDescriptionId: string
  cvId: string
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
