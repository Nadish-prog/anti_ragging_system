import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { getRoleRedirectPath } from '../../utils/roleRedirect'
import { InputField } from '../../components/forms/InputField'
import { SelectField } from '../../components/forms/SelectField'
import { Button } from '../../components/forms/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_no: '',
    department_id: '1',
    roll_no: '',
    faculty_code: '',
    year: '',
    gender: '', // default empty
    role: 'student' // default
  })

  const DEPARTMENTS = [
    { value: '1', label: 'Computer Science' },
    { value: '2', label: 'Electronics' },
    { value: '3', label: 'Mechanical' },
    { value: '4', label: 'Civil' },
    { value: '5', label: 'Information Technology' }
  ]
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { token, user } = await authService.register(formData)
      login(token, user)
      toast.success('Registration successful!')
      
      const targetPath = getRoleRedirectPath(user.role)
      navigate(targetPath, { replace: true })
    } catch (err) {
      console.error('Registration error', err)
      setError(err.response?.data?.message || 'Failed to register account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl px-6 py-12 pb-24 mx-auto sm:px-12 lg:px-16">
        <div className="flex items-center justify-center gap-3 mb-10">
          <Shield className="w-10 h-10 text-blue-600 drop-shadow-md" />
          <span className="text-2xl font-bold tracking-tight text-gray-900 font-display">SafeCampus</span>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 font-display mb-3">
            Create an Account
          </h2>
          <p className="text-base text-gray-500 mb-8">
            Join the Anti-Ragging platform. Fill out the details below to complete your registration.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle gradient blob background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <ErrorMessage message={error} className="mb-6 relative z-10" />
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />

              <InputField
                label="Email Address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />

              <InputField
                label="Phone Number"
                id="phone_no"
                name="phone_no"
                type="tel"
                required
                placeholder="1234567890"
                value={formData.phone_no}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Department"
                id="department_id"
                name="department_id"
                required
                value={formData.department_id}
                onChange={handleChange}
                options={DEPARTMENTS}
              />

              <SelectField
                label="Gender"
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: '1', label: 'Male' },
                  { value: '2', label: 'Female' },
                  { value: '3', label: 'Other' }
                ]}
              />
            </div>

            <div className="pt-2 border-t border-gray-100" />

            <SelectField
              label="Account Type"
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' }
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end transition-all">
              {formData.role === 'student' && (
                <>
                  <InputField
                    label="Student Roll No"
                    id="roll_no"
                    name="roll_no"
                    type="text"
                    required
                    placeholder="E.g., CS2023001"
                    value={formData.roll_no}
                    onChange={handleChange}
                    className="mb-0"
                  />
                  <SelectField
                    label="Year of Study"
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="mb-0"
                    options={[
                      { value: '', label: 'Select Year' },
                      { value: '1', label: '1st Year' },
                      { value: '2', label: '2nd Year' },
                      { value: '3', label: '3rd Year' },
                      { value: '4', label: '4th Year' }
                    ]}
                  />
                </>
              )}

              {formData.role === 'faculty' && (
                <div className="col-span-2">
                  <InputField
                    label="Faculty ID Code"
                    id="faculty_code"
                    name="faculty_code"
                    type="text"
                    required
                    placeholder="E.g., FAC2023001"
                    value={formData.faculty_code}
                    onChange={handleChange}
                    className="mb-0"
                  />
                </div>
              )}
            </div>

            <div className="pt-6">
              <Button type="submit" fullWidth isLoading={loading} className="py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                Create Secure Account
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center bg-gray-50/50 p-4 rounded-xl relative z-10 border border-gray-100">
            <span className="text-gray-500 font-medium text-sm">Already have an account? </span>
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors ml-1">
              Sign in securely
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
