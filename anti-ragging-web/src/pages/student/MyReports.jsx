import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, FileText } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { ReportCard } from '../../components/reports/ReportCard'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { EmptyState } from '../../components/ui/EmptyState'

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await reportService.getMyReports()
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList)
    } catch (err) {
      console.error(err)
      setError('Failed to load your reports.')
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(r => 
    r.title?.toLowerCase().includes(search.toLowerCase()) || 
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">My Reports</h1>
          <p className="mt-1 text-sm text-gray-500">View and track the status of complaints you have filed.</p>
        </div>
        <Link
          to="/student/reports/create"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Report
        </Link>
      </div>

      <div className="mb-6 relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {loading ? (
        <Loader className="mt-12" />
      ) : filteredReports.length === 0 ? (
        <EmptyState 
          icon={FileText} 
          title="No reports found" 
          description="You haven't filed any reports matching this search."
        />
      ) : (
        <div className="flex-1 overflow-auto pb-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} to={`/student/reports/${report.id}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


