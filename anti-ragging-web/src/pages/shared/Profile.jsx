import { useAuth } from '../../context/AuthContext'
import { User, Mail, Shield } from 'lucide-react'
import { Button } from '../../components/forms/Button'

const DEPARTMENTS = {
  1: 'Computer Science',
  2: 'Electronics',
  3: 'Mechanical',
  4: 'Civil',
  5: 'Information Technology'
}

export default function Profile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 text-center sm:text-left sm:flex sm:items-center sm:justify-start border-b border-gray-100 bg-gray-50/50">
          <div className="mx-auto sm:mx-0 shrink-0 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {(user.full_name || user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-8">
            <h2 className="text-2xl font-bold text-gray-900">{user.full_name || user.name}</h2>
            <p className="text-gray-500 mt-1 flex items-center justify-center sm:justify-start">
              <Mail className="w-4 h-4 mr-1.5" />
              {user.email}
            </p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-100 text-blue-800 uppercase border border-blue-200">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              {user.role} Role
            </div>
          </div>
        </div>
        
        <div className="p-8 sm:p-10">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Account Details</h3>
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1 border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-base text-gray-900">{user.full_name || user.name}</dd>
            </div>
            <div className="sm:col-span-1 border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500">Email Address</dt>
              <dd className="mt-1 text-base text-gray-900">{user.email}</dd>
            </div>
            <div className="sm:col-span-1 border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500">System Role</dt>
              <dd className="mt-1 text-base text-gray-900 capitalize">{user.role}</dd>
            </div>
            <div className="sm:col-span-1 border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
              <dd className="mt-1 text-base text-green-600 font-medium">Active</dd>
            </div>

            {user.role === 'student' && (
              <>
                <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                  <dt className="text-sm font-medium text-gray-500">Roll Number</dt>
                  <dd className="mt-1 text-base text-gray-900 uppercase">{user.roll_no || 'Not Set'}</dd>
                </div>
                <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-base text-gray-900 uppercase">{user.department_id ? (DEPARTMENTS[user.department_id] || `Dept ${user.department_id}`) : 'Not Assigned'}</dd>
                </div>
                <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                  <dt className="text-sm font-medium text-gray-500">Current Year</dt>
                  <dd className="mt-1 text-base text-gray-900">{user.year ? `Year ${user.year}` : 'Not Set'}</dd>
                </div>
              </>
            )}

            {(user.role === 'faculty' || user.role === 'admin') && (
              <>
                <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                  <dt className="text-sm font-medium text-gray-500">Faculty/Staff ID</dt>
                  <dd className="mt-1 text-base text-gray-900 uppercase">{user.faculty_code || 'Not Set'}</dd>
                </div>
                <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-base text-gray-900 uppercase">{user.department_id ? (DEPARTMENTS[user.department_id] || `Dept ${user.department_id}`) : 'Admin Root'}</dd>
                </div>
              </>
            )}
          </dl>

        </div>
      </div>
    </div>
  )
}
