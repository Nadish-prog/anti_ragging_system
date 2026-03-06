import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, FileText, Activity } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { ReportCard } from '../../components/reports/ReportCard'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
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
      const data = await reportService.getMyReports()
      // ensure it's an array and grab top 3
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList.slice(0, 3))
    } catch (err) {
      console.error(err)
      setError('Failed to load recent reports.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader fullScreen />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Welcome back, {user?.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Student Dashboard - Track and manage your reports safely.</p>
        </div>
        <Link
          to="/student/reports/create"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          File New Report
        </Link>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stat Cards placeholder */}
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{reports.length}</p>
        </div>
        
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Pending Actions</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Activity size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {reports.filter(r => r.status === 'pending').length}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 font-display">Recent Reports</h2>
          <Link to="/student/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-200 border-dashed rounded-xl">
            <h3 className="text-sm font-medium text-gray-900">No reports filed</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't filed any reports yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} to={`/student/reports/${report.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
