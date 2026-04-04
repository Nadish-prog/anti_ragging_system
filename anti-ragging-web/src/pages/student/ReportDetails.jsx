import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, FileText as FileIcon, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { StatusBadge } from '../../components/reports/StatusBadge'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'

export default function ReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTimeline, setShowTimeline] = useState(false)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const data = await reportService.getReportDetails(id)
      setReport(data.complaint || data)
    } catch (err) {
      console.error(err)
      setError('Failed to load report details.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader fullScreen />
  if (error) return <ErrorMessage message={error} />
  if (!report) return <ErrorMessage message="Report not found" />

  const dateStr = new Date(report.createdAt).toLocaleString()

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={-1} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 font-display sm:text-2xl break-words pr-4">
              {report.title}
            </h1>
            <div className="mt-4 sm:mt-0 shrink-0">
              <StatusBadge status={report.status} className="text-sm px-3 py-1" />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium mr-1 text-gray-700">ID:</span> #{report.id?.toString().slice(-6).toUpperCase()}
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1 text-gray-700">Type:</span> {report.incidentType || 'Not specified'}
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1 text-gray-700">Anonymous:</span> 
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ml-1 ${report.isAnonymous ? 'text-amber-600 bg-amber-50' : 'text-gray-600 bg-gray-100'}`}>
                {report.isAnonymous ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              Filed on: {dateStr}
            </div>
            {report.incidentDate && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                Incident: {new Date(report.incidentDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Description</h3>
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 whitespace-pre-wrap">
            {report.description}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Location</h3>
              <p className="text-gray-700">{report.location || 'Not specified'}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Parties Involved</h3>
              {report.accused && report.accused.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {report.accused.map((person, idx) => (
                    <li key={idx}>{person.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Not specified</p>
              )}
            </div>
            
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Assigned Investigator</h3>
              {report.faculty ? (
                <div className="flex items-start text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3 shrink-0 mt-0.5">
                    {report.faculty.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{report.faculty.name}</p>
                    <p className="text-xs text-gray-500">Faculty Investigator</p>
                    {(report.faculty.email || report.faculty.phone) && (
                      <div className="mt-2 text-sm text-gray-600 flex flex-col gap-1 border-t border-gray-100 pt-2">
                        {report.faculty.email && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500">Email:</span> {report.faculty.email}
                          </div>
                        )}
                        {report.faculty.phone && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-500">Phone:</span> {report.faculty.phone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Not assigned yet</p>
              )}
            </div>
          </div>
          
          {report.remarks && (
            <div className="mt-10 p-5 rounded-lg bg-gray-50 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Official Remarks</h3>
              <p className="text-gray-700">{report.remarks}</p>
            </div>
          )}

          {report.timeline && report.timeline.length > 0 && (
            <div className="mt-12">
              <button 
                onClick={() => setShowTimeline(!showTimeline)}
                className="flex items-center justify-between w-full bg-white border border-gray-200 hover:bg-gray-50 px-5 py-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">View Complaint Timeline</h3>
                </div>
                {showTimeline ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </button>

              {showTimeline && (
                <div className="mt-4 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
                    {report.timeline.map((event, idx) => (
                      <div key={idx} className="relative pl-6">
                        <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-blue-100 border-2 border-blue-600"></span>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1 gap-4">
                          <h4 
                            className="text-sm font-semibold text-gray-900 flex-1 leading-relaxed line-clamp-1"
                            title={event.action}
                          >
                            {event.action}
                          </h4>
                          <time className="text-xs text-gray-500 flex items-center shrink-0 mt-1 sm:mt-0 font-medium sm:ml-4">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {new Date(event.timestamp).toLocaleString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </time>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
