import { useAuthStore } from '../../store/auth.store'
import { useLogout } from '../../hooks/useAuth'

export function Header() {
  const { user } = useAuthStore()
  const logout = useLogout()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800 leading-none">{user?.name}</p>
          </div>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
