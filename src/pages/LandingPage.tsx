import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin, useRegister } from '../hooks/useAuth'
import { useAuthStore } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

// ─── Auth Modal ───────────────────────────────────────────────────────────────

type ModalMode = 'login' | 'register'

function AuthModal({ mode, onClose, onSwitch }: {
  mode: ModalMode
  onClose: () => void
  onSwitch: (m: ModalMode) => void
}) {
  const login = useLogin()
  const register_ = useRegister()

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const isLogin = mode === 'login'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isLogin ? 'Sign in' : 'Create an account'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {isLogin ? 'Welcome back to CV Scan' : 'Get started for free'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100 mb-5">
          <button
            onClick={() => onSwitch('login')}
            className={`pb-3 mr-6 text-sm font-medium border-b-2 transition-colors ${
              isLogin ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => onSwitch('register')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              !isLogin ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          {isLogin ? (
            <>
              {login.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">
                    {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Incorrect email or password.'}
                  </p>
                </div>
              )}
              <form onSubmit={loginForm.handleSubmit((d) => login.mutate(d))} className="space-y-4">
                <Input label="Email" type="email" placeholder="you@example.com"
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')} />
                <Input label="Password" type="password" placeholder="••••••••"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')} />
                <Button type="submit" className="w-full" loading={login.isPending}>
                  Sign In
                </Button>
              </form>
            </>
          ) : (
            <>
              {register_.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">
                    {(register_.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.'}
                  </p>
                </div>
              )}
              <form
                onSubmit={registerForm.handleSubmit(({ name, email, password }) =>
                  register_.mutate({ name, email, password })
                )}
                className="space-y-4"
              >
                <Input label="Full Name" placeholder="John Doe"
                  error={registerForm.formState.errors.name?.message}
                  {...registerForm.register('name')} />
                <Input label="Email" type="email" placeholder="you@example.com"
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register('email')} />
                <Input label="Password" type="password" placeholder="••••••••"
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')} />
                <Input label="Confirm Password" type="password" placeholder="••••••••"
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')} />
                <Button type="submit" className="w-full" loading={register_.isPending}>
                  Create Account
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── App Mockup ───────────────────────────────────────────────────────────────

function AppMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200 bg-white">
      {/* Browser chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded border border-gray-200 px-3 py-1 text-xs text-gray-400 max-w-xs mx-auto text-center">
          app.cvscan.io/evaluations/result
        </div>
      </div>

      {/* App chrome */}
      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="w-44 bg-white border-r border-gray-100 flex flex-col py-3 px-2 shrink-0">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="h-5 w-5 rounded bg-red-500 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-800">CV Scan</span>
          </div>
          {[
            { label: 'Dashboard', active: false },
            { label: 'Job Descriptions', active: false },
            { label: 'CVs', active: false },
            { label: 'Evaluations', active: true },
          ].map((item) => (
            <div
              key={item.label}
              className={`px-2.5 py-1.5 rounded-md text-xs mb-0.5 font-medium ${
                item.active ? 'bg-red-50 text-red-500' : 'text-gray-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 bg-gray-50 p-5 overflow-hidden">
          {/* Page title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Evaluation Result</p>
              <p className="text-xs text-gray-400 mt-0.5">Senior Frontend Engineer · nguyen_van_a_cv.pdf</p>
            </div>
            <span className="text-xs bg-green-50 text-green-600 font-medium px-2.5 py-1 rounded-full border border-green-100">
              Completed
            </span>
          </div>

          {/* Score + Bars row */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
            <div className="flex items-center gap-6">
              {/* Circle score */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative h-20 w-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.82)}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-emerald-600">82</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">Excellent</p>
              </div>

              {/* Score bars */}
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'Skills Match', pct: 90, color: 'bg-emerald-500' },
                  { label: 'Experience', pct: 78, color: 'bg-emerald-500' },
                  { label: 'Education', pct: 85, color: 'bg-emerald-500' },
                  { label: 'Achievements', pct: 70, color: 'bg-sky-500' },
                  { label: 'Relevance', pct: 88, color: 'bg-emerald-500' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">{bar.label}</span>
                      <span className="text-xs text-gray-400">{bar.pct}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation + summary row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3.5">
              <p className="text-xs text-gray-400 mb-1.5">Recommendation</p>
              <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full border border-green-100">
                Strong Yes
              </span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3.5">
              <p className="text-xs text-gray-400 mb-1.5">Summary</p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                Strong match for the role. Candidate demonstrates solid skills across required areas with relevant experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CV List Mockup ────────────────────────────────────────────────────────────

function CVListMockup() {
  const cvs = [
    { name: 'nguyen_van_a_cv.pdf', candidate: 'Nguyen Van A', status: 'Parsed', color: 'text-green-600 bg-green-50 border-green-100' },
    { name: 'tran_thi_b_resume.pdf', candidate: 'Tran Thi B', status: 'Parsed', color: 'text-green-600 bg-green-50 border-green-100' },
    { name: 'le_van_c_cv.docx', candidate: 'Le Van C', status: 'Processing', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ]
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200 bg-white">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded border border-gray-200 px-3 py-1 text-xs text-gray-400 max-w-xs mx-auto text-center">
          app.cvscan.io/cv
        </div>
      </div>

      <div className="flex h-72">
        {/* Sidebar */}
        <div className="w-44 bg-white border-r border-gray-100 flex flex-col py-3 px-2 shrink-0">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="h-5 w-5 rounded bg-red-500 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-800">CV Scan</span>
          </div>
          {[
            { label: 'Dashboard', active: false },
            { label: 'Job Descriptions', active: false },
            { label: 'CVs', active: true },
            { label: 'Evaluations', active: false },
          ].map((item) => (
            <div key={item.label}
              className={`px-2.5 py-1.5 rounded-md text-xs mb-0.5 font-medium ${item.active ? 'bg-red-50 text-red-500' : 'text-gray-400'}`}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">CVs</p>
            <div className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium">Upload CV</div>
          </div>
          <div className="space-y-2">
            {cvs.map((cv) => (
              <div key={cv.name} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">{cv.name}</p>
                    <p className="text-xs text-gray-400">{cv.candidate}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cv.color}`}>{cv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Smart CV Parsing',
    desc: 'Automatically extracts skills, experience, education, and contact information from PDF and DOCX files.',
  },
  {
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Detailed Scoring',
    desc: 'Score candidates across 5 categories: Skills, Experience, Education, Achievements, and Relevance.',
  },
  {
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Clear Recommendations',
    desc: 'Get decisive hire/no-hire signals from Strong Yes to Strong No to streamline your decision process.',
  },
  {
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'JD Management',
    desc: 'Keep all your job descriptions organised in one place. Skills are auto-extracted from each role.',
  },
  {
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: 'Easy CV Upload',
    desc: 'Drag and drop PDF or DOCX resumes. Candidate information is parsed and ready instantly.',
  },
  {
    icon: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Dashboard Overview',
    desc: 'Track all your job descriptions, uploaded CVs, and completed evaluations in one clean dashboard.',
  },
]

const steps = [
  { num: '01', title: 'Add a Job Description', desc: 'Create a JD and relevant skills will be extracted automatically.' },
  { num: '02', title: 'Upload Candidate CVs', desc: 'Upload PDF or DOCX files. Candidate data is parsed and structured.' },
  { num: '03', title: 'Run an Evaluation', desc: 'Select a JD and a CV, then start the evaluation with one click.' },
  { num: '04', title: 'Review Results', desc: 'Get scores, written feedback, and a final hire/no-hire recommendation.' },
]

// ─── Landing Page ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const [modal, setModal] = useState<ModalMode | null>(null)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const openLogin = () => setModal('login')
  const openRegister = () => setModal('register')
  const closeModal = () => setModal(null)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-red-500 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">CV Scan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openLogin}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={openRegister}
              className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full mb-6">
              Resume Evaluation Platform
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              Evaluate candidates<br />
              <span className="text-red-500">faster and smarter</span>
            </h1>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed">
              Upload CVs, match them against job descriptions, and get detailed scores with written feedback and a clear recommendation.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={openRegister}
                className="inline-flex items-center gap-2 bg-red-500 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Get started free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={openLogin}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>

          {/* Main mockup */}
          <AppMockup />
        </div>
      </section>

      {/* ── CV List Preview ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 leading-snug">
                All your CVs in one organised place
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Upload resumes in bulk, track parsing status, and access candidate profiles at a glance. No more digging through email attachments.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'PDF and DOCX support',
                  'Instant parsing of skills, experience and education',
                  'Status tracking for every uploaded file',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <CVListMockup />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to hire smarter</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From CV upload to final recommendation — a complete screening workflow in one tool.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center mb-3.5">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-3">Four steps to a complete candidate evaluation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num}>
                <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="text-gray-500 mt-3">
            Create a free account and start evaluating candidates today.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={openRegister}
              className="bg-red-500 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Create free account
            </button>
            <button
              onClick={openLogin}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-7 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-red-500 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-sm text-gray-700">CV Scan</span>
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} CV Scan. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <button onClick={openLogin} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Sign In</button>
            <button onClick={openRegister} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Register</button>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={closeModal}
          onSwitch={(m) => setModal(m)}
        />
      )}
    </div>
  )
}
