import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { getRoleRedirectPath } from '../../utils/roleRedirect'
import { InputField } from '../../components/forms/InputField'
import { Button } from '../../components/forms/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { token, user } = await authService.login(formData)
      // Save auth state
      login(token, user)
      toast.success('Login successful!')
      
      // Navigate to intended page or role dashboard
      const targetPath = from || getRoleRedirectPath(user.role)
      navigate(targetPath, { replace: true })
      
    } catch (err) {
      console.error('Login error', err)
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md px-6 py-12 pb-24 mx-auto lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-center text-gray-900 font-display text-balance">
            Anti-Ragging System
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-8 py-10 bg-white border border-gray-100 shadow-xl rounded-2xl shadow-gray-200/50">
            <ErrorMessage message={error} className="mb-6" />
            
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />

              <Button type="submit" fullWidth isLoading={loading}>
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
