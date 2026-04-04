import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, ShieldAlert, FileText, Download, Target, Users, AlertOctagon, X, UserX } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { StatusBadge } from '../../components/reports/StatusBadge'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { AssignFacultyModal } from '../../components/reports/AssignFacultyModal'
import { Button } from '../../components/forms/Button'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { SelectField } from '../../components/forms/SelectField'
import toast from 'react-hot-toast'

const DEPARTMENTS = {
  1: 'Computer Science',
  2: 'Electronics',
  3: 'Mechanical',
  4: 'Civil',
  5: 'Information Technology'
}

export default function AdminReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectSeverity, setRejectSeverity] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [rejectError, setRejectError] = useState(null)

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

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectReason || !rejectSeverity) return

    setRejecting(true)
    setRejectError(null)

    try {
      await reportService.updateReportStatus(report.id, {
        status: 'rejected',
        remarks: rejectReason,
        severityId: rejectSeverity
      })
      toast.success('Report rejected successfully')
      setIsRejectModalOpen(false)
      fetchDetail()
    } catch (err) {
      console.error(err)
      setRejectError(err.response?.data?.message || err.message || 'Failed to reject report')
    } finally {
      setRejecting(false)
    }
  }

  if (loading) return <Loader fullScreen />
  if (error) return <ErrorMessage message={error} />
  if (!report) return <ErrorMessage message="Report not found" />

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/admin/reports" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to all reports
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100 sm:px-8 bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display sm:text-2xl break-words mb-2 flex items-center gap-3">
              {report.title}
              {report.severity && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                  report.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                  report.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  report.severity === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-green-50 text-green-700 border-green-200'
                }`}>
                  {report.severity}
                </span>
              )}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
                <span className="font-medium mr-1 text-gray-700">ID: #{report.id?.toString().slice(-6).toUpperCase()}</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" /> Filed: {new Date(report.createdAt).toLocaleDateString()}
                </span>
                {report.incidentType && (
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1.5" /> {report.incidentType}
                  </span>
                )}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 items-center">
            <StatusBadge status={report.status} />
            {report.status?.toLowerCase() === 'open' && (
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => setIsRejectModalOpen(true)}>
                Reject
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {report.description}
              </div>
            </div>
            
            {report.accused && report.accused.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Parties Involved
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {report.accused.map((person, idx) => (
                    <li key={idx}>{person.accused_name || person.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {report.evidence && report.evidence.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Supporting Evidence
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.evidence.map((item, idx) => (
                    <a 
                      key={idx} 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center mr-3 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Evidence Attachment {idx + 1}</p>
                        <p className="text-xs text-gray-500">{new Date(item.uploaded_at || item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {report.remarks && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Final Remarks</h3>
                <p className="text-gray-700">{report.remarks}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Investigator</h3>
              
              {report.faculty ? (
                <div className="flex items-center text-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3 shrink-0 text-lg">
                    {report.faculty.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{report.faculty.name}</p>
                    <p className="text-xs text-gray-500">{report.faculty.email}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <ShieldAlert className="w-8 h-8 mx-auto text-red-400 mb-2" />
                  <p className="text-sm font-medium text-red-800 mb-3">Not Assigned</p>
                  {report.status?.toLowerCase() === 'open' && (
                    <Button fullWidth size="sm" onClick={() => setIsModalOpen(true)}>
                      Assign Faculty
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 relative">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex justify-between items-center">
                 Complainant
                 {report.isAnonymous && (
                   <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold flex items-center">
                     <AlertOctagon className="w-3 h-3 mr-1" /> Anonymous
                   </span>
                 )}
               </h3>
               {report.student ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{report.student.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500 mt-1">{report.student.email}</p>
                  </div>
                  
                  {report.student.phone && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium text-gray-500 w-24">Phone:</span>
                      <span>{report.student.phone}</span>
                    </div>
                  )}

                  {report.student.rollNo && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium text-gray-500 w-24">Roll No:</span>
                      <span className="uppercase">{report.student.rollNo}</span>
                    </div>
                  )}

                  {report.student.departmentId && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium text-gray-500 w-24">Department:</span>
                      <span className="uppercase">{DEPARTMENTS[report.student.departmentId] || `Dept ${report.student.departmentId}`}</span>
                    </div>
                  )}
                  
                  {report.student.year && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="font-medium text-gray-500 w-24">Year:</span>
                      <span>{report.student.year} Year</span>
                    </div>
                  )}
                </div>
               ) : (
                 <p className="text-gray-500 italic">No details available</p>
               )}
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <AssignFacultyModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          reportId={report.id}
          onAssignSuccess={fetchDetail}
        />
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all"
            role="dialog"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50/50">
              <h2 className="text-lg font-bold text-red-900 font-display flex items-center">
                <UserX className="w-5 h-5 mr-2 text-red-600" />
                Reject Complaint
              </h2>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                disabled={rejecting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                You are about to reject complaint <span className="font-semibold text-gray-900">#{report.id?.toString().slice(-6).toUpperCase()}</span>. This action cannot be undone. Please provide a reason.
              </p>
              
              <ErrorMessage message={rejectError} className="mb-4" />

              <form onSubmit={handleRejectSubmit} className="space-y-6">
                <TextAreaField
                  label="Reason for Rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Explain why this complaint is being rejected..."
                  disabled={rejecting}
                />
                
                <SelectField
                  label="Severity Level (For Logging)"
                  options={[
                    { value: '1', label: 'LOW' },
                    { value: '2', label: 'MEDIUM' },
                    { value: '3', label: 'HIGH' },
                    { value: '4', label: 'CRITICAL' },
                  ]}
                  value={rejectSeverity}
                  onChange={(e) => setRejectSeverity(e.target.value)}
                  required
                  disabled={rejecting}
                  placeholder="Select assessed severity"
                />

                <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={rejecting}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={rejecting} disabled={!rejectReason || !rejectSeverity} className="bg-red-600 hover:bg-red-700 text-white border border-transparent shadow-sm">
                    Confirm Rejection
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
