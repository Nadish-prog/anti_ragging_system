import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 -ml-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary-500)]"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center font-bold">
            {(user?.full_name || user?.name || 'User').charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:block text-gray-700">{user?.full_name || user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  )
}
