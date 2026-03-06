import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 py-12 pb-24 mx-auto lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-center text-gray-900 font-display text-balance">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Join the Anti-Ragging platform
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-8 py-10 bg-white border border-gray-100 shadow-xl rounded-2xl shadow-gray-200/50">
            <ErrorMessage message={error} className="mb-6" />
            
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
              />
              
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
                label="Role Registration"
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'faculty', label: 'Faculty' },
                  { value: 'admin', label: 'Admin (System use only)' } // Might need to be removed in prod
                ]}
              />

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
                  />
                  <SelectField
                    label="Year of Study"
                    id="year"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
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

              {(formData.role === 'faculty' || formData.role === 'admin') && (
                <InputField
                  label="Faculty/Admin ID"
                  id="faculty_code"
                  name="faculty_code"
                  type="text"
                  required
                  placeholder="E.g., FAC2023001"
                  value={formData.faculty_code}
                  onChange={handleChange}
                />
              )}

              <div className="pt-2">
                <Button type="submit" fullWidth isLoading={loading}>
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
