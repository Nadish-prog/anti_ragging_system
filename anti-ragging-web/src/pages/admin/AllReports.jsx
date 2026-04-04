import { useState, useEffect } from 'react'
import { Search, Filter, ShieldAlert } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { ReportTable } from '../../components/reports/ReportTable'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { EmptyState } from '../../components/ui/EmptyState'

export default function AllReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [search, setSearch] = useState('')
  const [assignmentFilter, setAssignmentFilter] = useState('all') // all, unassigned, assigned
  const [statusFilter, setStatusFilter] = useState('all') // all, open, investigating, rejected, closed

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await reportService.getAllReports()
      const reportsList = Array.isArray(data) ? data : (data.complaints || [])
      setReports(reportsList)
    } catch (err) {
      console.error(err)
      setError('Failed to load system reports.')
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.id?.toString().includes(search)
    
    let matchesAssign = true
    if (assignmentFilter === 'unassigned') matchesAssign = !r.facultyId
    if (assignmentFilter === 'assigned') matchesAssign = !!r.facultyId

    const matchesStatus = statusFilter === 'all' || r.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesAssign && matchesStatus
  })

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display">Manage All Reports</h1>
        <p className="mt-1 text-sm text-gray-500">View system-wide complaints and assign investigators.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Search all reports by ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative shrink-0 flex gap-3">
          <div className="relative">
            <select
              className="w-full sm:w-auto py-2.5 pl-4 pr-10 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              className="w-full sm:w-auto py-2.5 pl-4 pr-10 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
            >
              <option value="all">All Assignments</option>
              <option value="unassigned">Unassigned Only</option>
              <option value="assigned">Assigned</option>
            </select>
            <Filter className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {loading ? (
        <Loader className="mt-12" />
      ) : filteredReports.length === 0 ? (
        <EmptyState 
          icon={ShieldAlert} 
          title="No reports found" 
          description="There are no reports matching your filters."
        />
      ) : (
        <div className="flex-1 overflow-auto pb-4">
          <ReportTable reports={filteredReports} basePath="/admin/reports" />
        </div>
      )}
    </div>
  )
}
