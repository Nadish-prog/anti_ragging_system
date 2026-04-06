import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'
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
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="flex flex-col justify-center flex-1 w-full max-w-xl px-6 py-12 pb-24 mx-auto sm:px-12 lg:px-16">
        <div className="flex items-center justify-center gap-3 mb-10">
          <Shield className="w-10 h-10 text-blue-600 drop-shadow-md" />
          <span className="text-2xl font-bold tracking-tight text-gray-900 font-display">SafeCampus</span>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 font-display mb-3">
            Welcome Back
          </h2>
          <p className="text-base text-gray-500 mb-8">
            Sign in to your account securely to continue.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle gradient blob background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <ErrorMessage message={error} className="mb-6 relative z-10" />
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
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

            <div className="pt-2">
              <Button type="submit" fullWidth isLoading={loading} className="py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center bg-gray-50/50 p-4 rounded-xl relative z-10 border border-gray-100">
            <span className="text-gray-500 font-medium text-sm">Don't have an account? </span>
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors ml-1">
              Create one now
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
