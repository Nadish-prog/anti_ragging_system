import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { StatusBadge } from '../../components/reports/StatusBadge'
import { Loader } from '../../components/ui/Loader'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { InputField } from '../../components/forms/InputField'
import { SelectField } from '../../components/forms/SelectField'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { Button } from '../../components/forms/Button'
import toast from 'react-hot-toast'

const DEPARTMENTS = {
  1: 'Computer Science',
  2: 'Electronics',
  3: 'Mechanical',
  4: 'Civil',
  5: 'Information Technology'
}

export default function FacultyReportDetails() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [updateData, setUpdateData] = useState({ status: '', remarks: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const data = await reportService.getReportDetails(id)
      const r = data.complaint || data
      setReport(r)
      setUpdateData({ status: (r.status === 'resolved' || r.status === 'rejected') ? r.status : 'resolved', remarks: r.remarks || '' })
    } catch (err) {
      console.error(err)
      setError('Failed to load report details.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await reportService.updateReportStatus(id, updateData)
      toast.success('Report updated successfully')
      fetchDetail() // refresh data
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update report')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <Loader fullScreen />
  if (error) return <ErrorMessage message={error} />
  if (!report) return <ErrorMessage message="Report not found" />

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Report Information */}
      <div className="lg:col-span-2">
        <Link to="/faculty/assigned" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to list
        </Link>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-100 sm:px-8 bg-gray-50/50">
            <h1 className="text-xl font-bold text-gray-900 font-display sm:text-2xl break-words mb-4">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium mr-1 text-gray-700">ID:</span> #{report.id?.toString().slice(-6).toUpperCase()}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" />
                Filed on: {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {report.description}
              </div>
            </div>

            {report.location && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Location</h3>
                <p className="text-gray-700">{report.location}</p>
              </div>
            )}
            
            {report.accused && report.accused.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Parties Involved</h3>
                <div className="flex flex-wrap gap-2">
                  {report.accused.map((person, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-100">
                      {person.accused_name || person.name || person}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Complainant Details</h3>
              {report.isAnonymous ? (
                <p className="text-gray-700 italic">Anonymous</p>
              ) : report.student ? (
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-semibold text-gray-900">Name:</span> <span>{report.student.name}</span></p>
                  <p><span className="font-semibold text-gray-900">Email:</span> <span className="text-gray-600">{report.student.email}</span></p>
                  {report.student.phone && <p><span className="font-semibold text-gray-900">Phone:</span> <span className="text-gray-600">{report.student.phone}</span></p>}
                  {report.student.rollNo && <p><span className="font-semibold text-gray-900">Roll No:</span> <span className="text-gray-600 uppercase">{report.student.rollNo}</span></p>}
                  {report.student.departmentId && <p><span className="font-semibold text-gray-900">Department:</span> <span className="text-gray-600 uppercase">{DEPARTMENTS[report.student.departmentId] || `Dept ${report.student.departmentId}`}</span></p>}
                  {report.student.year && <p><span className="font-semibold text-gray-900">Year:</span> <span className="text-gray-600">{report.student.year} Year</span></p>}
                </div>
              ) : (
                <p className="text-gray-700 italic">No details available</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2 mt-8">Evidence</h3>
              {report.evidence && report.evidence.length > 0 ? (
                <div className="text-gray-700 flex flex-col gap-2">
                  {report.evidence.map((ev, idx) => (
                    <a key={idx} href={ev.file_url || ev} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center gap-2 w-fit bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition-colors">
                      <FileText className="w-4 h-4" /> View Attached Evidence {report.evidence.length > 1 ? idx + 1 : ''}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No evidence provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Update Actions */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 pt-12 lg:pt-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 font-display mb-4">Manage Status</h2>
            
            <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
               <span className="text-sm font-medium text-gray-700">Current Status:</span>
               <StatusBadge status={report.status} />
            </div>

            {!['resolved', 'closed', 'rejected'].includes(report.status?.toLowerCase()) ? (
              <form onSubmit={handleUpdate} className="space-y-4 border-t border-gray-100 pt-6">
                <SelectField
                  label="Update Status"
                  name="status"
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  options={[
                    { value: 'resolved', label: 'Resolved / Approved' },
                    { value: 'rejected', label: 'Rejected / Invalid' }
                  ]}
                />

                {updateData.status !== 'resolved' && (
                  <TextAreaField
                    label="Official Remarks"
                    name="remarks"
                    rows={4}
                    placeholder="Provide reasoning or findings for this status..."
                    value={updateData.remarks}
                    onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
                  />
                )}

                <Button type="submit" fullWidth isLoading={updating}>
                  Save Changes
                </Button>
              </form>
            ) : (
              report.remarks && (
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Official Remarks</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                    {report.remarks}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
