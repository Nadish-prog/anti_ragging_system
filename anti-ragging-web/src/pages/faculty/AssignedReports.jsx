import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { ReportTable } from '../../components/reports/ReportTable'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { EmptyState } from '../../components/ui/EmptyState'
import { FileSearch } from 'lucide-react'

export default function AssignedReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await reportService.getAssignedReports()
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList)
    } catch (err) {
      console.error(err)
      setError('Failed to load your assigned reports.')
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.id?.toString().includes(search)
    const matchesStatus = statusFilter === 'all' || r.status?.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Assigned Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Manage and update the status of complaints assigned to you.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Search by ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative shrink-0">
          <select
            className="w-full sm:w-auto py-2.5 pl-4 pr-10 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="investigating">Investigating</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
          <Filter className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {loading ? (
        <Loader className="mt-12" />
      ) : filteredReports.length === 0 ? (
        <EmptyState 
          icon={FileSearch} 
          title="No assignments found" 
          description="There are no reports matching your filters."
        />
      ) : (
        <div className="flex-1 overflow-auto pb-4">
          <ReportTable reports={filteredReports} basePath="/faculty/assigned" />
        </div>
      )}
    </div>
  )
}
