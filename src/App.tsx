import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { JDListPage } from './pages/jd/JDListPage'
import { JDCreatePage } from './pages/jd/JDCreatePage'
import { JDDetailPage } from './pages/jd/JDDetailPage'
import { CVListPage } from './pages/cv/CVListPage'
import { CVUploadPage } from './pages/cv/CVUploadPage'
import { CVDetailPage } from './pages/cv/CVDetailPage'
import { EvalListPage } from './pages/evaluation/EvalListPage'
import { EvalDetailPage } from './pages/evaluation/EvalDetailPage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jd" element={<JDListPage />} />
          <Route path="/jd/new" element={<JDCreatePage />} />
          <Route path="/jd/:id" element={<JDDetailPage />} />
          <Route path="/cv" element={<CVListPage />} />
          <Route path="/cv/upload" element={<CVUploadPage />} />
          <Route path="/cv/:id" element={<CVDetailPage />} />
          <Route path="/evaluations" element={<EvalListPage />} />
          <Route path="/evaluations/:id" element={<EvalDetailPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
