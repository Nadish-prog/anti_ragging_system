import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { KeyRound, Search, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [search, setSearch] = useState('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users')
      setUsers(res.data.users || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetClick = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setShowPassword(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
    setNewPassword('')
    setShowPassword(false)
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword) return

    try {
      setResetting(true)
      await api.post(`/users/${selectedUser.user_id}/reset-password`, {
        newPassword
      })
      toast.success('Password reset successfully')
      handleCloseModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetting(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
    u.faculty_code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Manage Users</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage passwords for students and faculty.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Search users by name, email, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {loading ? (
        <Loader className="mt-12" />
      ) : (
        <div className="flex-1 overflow-hidden bg-white/60 border border-gray-200/60 rounded-xl shadow-sm flex flex-col backdrop-blur-xl">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role & Dept
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                   <tr>
                     <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                       No users found matching your search.
                     </td>
                   </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-white/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold font-display">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize pb-1">{user.roles?.role_name?.toLowerCase()}</div>
                      <div className="text-xs text-gray-500">{user.departments?.department_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.roles?.role_name === 'STUDENT' ? user.roll_no : user.faculty_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleResetClick(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium rounded-lg transition-colors border border-blue-200/50"
                      >
                        <KeyRound className="w-4 h-4" />
                        Reset Pwd
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-display">Reset Password</h2>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              You are about to reset the password for <strong className="text-gray-900">{selectedUser?.full_name}</strong> ({selectedUser?.email}). This action cannot be undone.
            </p>

            <form onSubmit={handleResetSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || !newPassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
