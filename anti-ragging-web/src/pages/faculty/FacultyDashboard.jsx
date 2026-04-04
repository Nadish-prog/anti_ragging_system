import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileSearch, Clock, CheckCircle } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { ReportTable } from '../../components/reports/ReportTable'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { useAuth } from '../../context/AuthContext'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await reportService.getAssignedReports()
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList)
    } catch (err) {
      console.error(err)
      setError('Failed to load assigned reports.')
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = reports.filter(r => r.status?.toLowerCase() === 'investigating').length
  const resolvedCount = reports.filter(r => r.status?.toLowerCase() === 'closed').length

  if (loading) return <Loader fullScreen />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Faculty Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome, Professor {user?.name}. Manage your assigned investigations.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Assigned</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileSearch size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{reports.length}</p>
        </div>
        
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>

        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Closed</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{resolvedCount}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 font-display">Recently Assigned</h2>
          <Link to="/faculty/assigned" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-200 border-dashed rounded-xl">
            <h3 className="text-sm font-medium text-gray-900">All caught up</h3>
            <p className="mt-1 text-sm text-gray-500">You have no assigned reports currently.</p>
          </div>
        ) : (
          <ReportTable reports={reports.slice(0, 5)} basePath="/faculty/assigned" />
        )}
      </div>
    </div>
  )
}
