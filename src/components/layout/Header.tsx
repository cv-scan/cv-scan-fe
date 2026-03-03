import { useAuthStore } from '../../store/auth.store'
import { useLogout } from '../../hooks/useAuth'

export function Header() {
  const { user } = useAuthStore()
  const logout = useLogout()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-blue-600">CV Scan</h1>
        <span className="text-xs text-gray-400 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">AI-Powered</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{user?.name}</span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
