import { useState, useEffect } from 'react'
import { X, UserCheck } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { Button } from '../../components/forms/Button'
import { SelectField } from '../../components/forms/SelectField'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import toast from 'react-hot-toast'

export const AssignFacultyModal = ({ isOpen, onClose, reportId, onAssignSuccess }) => {
  const [facultyList, setFacultyList] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchFaculty()
    }
  }, [isOpen])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const data = await reportService.getFacultyMembers()
      const list = Array.isArray(data) ? data : (data.faculty || data.users || [])
      // Filter if necessary or just map
      setFacultyList(list.map(f => ({ value: f.id.toString(), label: `${f.name} (${f.email})` })))
    } catch (err) {
      console.error(err)
      setError('Failed to fetch faculty list.')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedFaculty || !selectedSeverity) return
    
    setAssigning(true)
    setError(null)
    
    try {
      await reportService.assignFaculty(reportId, selectedFaculty, selectedSeverity)
      toast.success('Faculty assigned successfully')
      onAssignSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to assign faculty')
    } finally {
      setAssigning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all"
        role="dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 font-display flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
            Assign Investigator
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Select a faculty member to investigate report <span className="font-semibold text-gray-900">#{reportId?.toString().slice(-6).toUpperCase()}</span>.
          </p>
          
          <ErrorMessage message={error} className="mb-4" />

          <form onSubmit={handleAssign} className="space-y-6">
            <SelectField
              label="Select Faculty Member"
              options={facultyList}
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              required
              disabled={loading}
              placeholder={loading ? "Loading faculty..." : "Choose investigator"}
            />
            
            <SelectField
              label="Severity Level"
              options={[
                { value: '1', label: 'LOW' },
                { value: '2', label: 'MEDIUM' },
                { value: '3', label: 'HIGH' },
                { value: '4', label: 'CRITICAL' },
              ]}
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              required
              placeholder="Assign a Severity Level"
            />

            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={assigning}>
                Cancel
              </Button>
              <Button type="submit" isLoading={assigning} disabled={!selectedFaculty || !selectedSeverity || loading}>
                Confirm Assignment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
