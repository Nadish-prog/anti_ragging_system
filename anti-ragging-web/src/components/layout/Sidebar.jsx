import { NavLink, useLocation } from 'react-router-dom'
import { Shield, Home, FileText, User, PlusCircle, LogOut, FileSearch, BarChart3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Sidebar = ({ isOpen, setisOpen }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const roleNavItems = {
    student: [
      { name: 'Dashboard', href: '/student/dashboard', icon: Home },
      { name: 'Create Report', href: '/student/reports/create', icon: PlusCircle },
      { name: 'My Reports', href: '/student/reports', icon: FileText },
      { name: 'Profile', href: '/student/profile', icon: User },
    ],
    faculty: [
      { name: 'Dashboard', href: '/faculty/dashboard', icon: Home },
      { name: 'Assigned Reports', href: '/faculty/assigned', icon: FileSearch },
      { name: 'Profile', href: '/faculty/profile', icon: User },
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
      { name: 'All Reports', href: '/admin/reports', icon: FileText },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Profile', href: '/admin/profile', icon: User },
    ]
  }

  const items = roleNavItems[user?.role?.toLowerCase()] || []

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={() => setisOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-primary-900)] text-white 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center h-16 px-6 sm:px-8 border-b border-white/10 shrink-0">
            <Shield className="w-8 h-8 text-blue-400 mr-3" />
            <span className="text-xl font-bold font-display tracking-tight text-white">SafeCampus</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {items.map((item) => {
              const isActive = location.pathname.startsWith(item.href) && 
                (item.href !== '/student/reports' || location.pathname === '/student/reports' || location.pathname.startsWith('/student/reports/view/'))

              // Make exact match for Dashboard
              const isStrictActive = isActive && (item.href.includes('dashboard') ? location.pathname === item.href : true)

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setisOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isStrictActive 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 mr-3 shrink-0 ${isStrictActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer User Area / Logout */}
          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex flex-col gap-2 mb-4 px-4">
               <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{user?.role}</span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
