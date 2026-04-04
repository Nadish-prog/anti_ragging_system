import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Users, ShieldAlert, Activity } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { ReportTable } from '../../components/reports/ReportTable'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
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
      const data = await reportService.getAllReports()
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList)
      
    } catch (err) {
      console.error(err)
      setError('Failed to load system dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const unassignedCount = reports.filter(r => !r.facultyId).length
  const investigatingCount = reports.filter(r => r.status === 'investigating').length
  const closedCount = reports.filter(r => r.status === 'closed').length

  if (loading) return <Loader fullScreen />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">System Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Admin dashboard to oversee all complaints and assignments.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Incidents</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Filter size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{reports.length}</p>
        </div>
        
        <div className="p-6 bg-white border border-red-100 rounded-xl shadow-sm bg-red-50/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-800">Unassigned</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-red-600">{unassignedCount}</p>
        </div>

        <div className="p-6 bg-white border border-yellow-100 rounded-xl shadow-sm bg-yellow-50/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-yellow-800">Investigating</h3>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Activity size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-yellow-700">{investigatingCount}</p>
        </div>

        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Closed</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Filter size={20}/></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-gray-900">{closedCount}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 font-display">Recent Activity</h2>
          <Link to="/admin/reports" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-200 border-dashed rounded-xl">
            <h3 className="text-sm font-medium text-gray-900">System Clear</h3>
            <p className="mt-1 text-sm text-gray-500">No reports exist in the system yet.</p>
          </div>
        ) : (
          <ReportTable reports={reports.slice(0, 7)} basePath="/admin/reports" />
        )}
      </div>
    </div>
  )
}
