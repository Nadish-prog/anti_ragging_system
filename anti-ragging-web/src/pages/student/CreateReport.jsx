import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Upload } from 'lucide-react'
import { reportService } from '../../services/reportService'
import { InputField } from '../../components/forms/InputField'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { Button } from '../../components/forms/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import toast from 'react-hot-toast'

export default function CreateReport() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: '',
    location: '',
    incidentTypeId: '',
    partiesInvolved: '',
    isAnonymous: false
  })
  
  const [evidenceFile, setEvidenceFile] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0])
    }
  }

  // Predefined incident types from backend database
  const incidentTypes = [
    { id: 1, name: 'VERBAL' },
    { id: 2, name: 'PHYSICAL' },
    { id: 3, name: 'SEXUAL' },
    { id: 4, name: 'CYBER' },
    { id: 5, name: 'FINANCIAL' },
    { id: 6, name: 'DISCRIMINATORY' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Format parties involved from comma separated string to array of objects
      const partiesArray = formData.partiesInvolved
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map(name => ({ accused_name: name }))

      const submissionData = {
        ...formData,
        partiesInvolved: partiesArray
      }

      const response = await reportService.createReport(submissionData)
      
      // If there's an evidence file, upload it immediately after report creation
      if (evidenceFile && response.complaint?.complaint_id) {
        await reportService.uploadEvidence(response.complaint.complaint_id, evidenceFile)
      }

      toast.success('Report submitted successfully. It will be reviewed shortly.')
      navigate('/student/reports')
    } catch (err) {
      console.error(err)
      // Handle both Axios errors (err.response.data.message) and our new native Error from fetch
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit report. Please try again.'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-display">File a Report</h1>
        <p className="mt-1 text-sm text-gray-500">
          Provide as much detail as possible. Your identity will remain confidential.
        </p>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-red-50/50">
          <div className="flex">
            <ShieldAlert className="w-6 h-6 mr-3 text-red-600 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Confidentiality Guarantee</h3>
              <p className="mt-1 text-xs text-red-600/80 text-balance">
                The information you provide here is strictly confidential and will only be accessible to authorized personnel. You are protected by the Anti-Ragging university policies.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <ErrorMessage message={error} className="mb-6" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Incident Title"
              name="title"
              required
              placeholder="Brief summary of the incident"
              value={formData.title}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-900">Incident Type <span className="text-red-500">*</span></label>
                <select 
                  name="incidentTypeId" 
                  value={formData.incidentTypeId} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select a type</option>
                  {incidentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <InputField
                label="Date of Incident"
                name="incidentDate"
                type="date"
                required
                value={formData.incidentDate}
                onChange={handleChange}
              />
            </div>

            <InputField
              label="Location"
              name="location"
              placeholder="Where did this occur?"
              value={formData.location}
              onChange={handleChange}
            />

            <TextAreaField
              label="Incident Description"
              name="description"
              required
              rows={6}
              placeholder="Describe what happened in detail."
              value={formData.description}
              onChange={handleChange}
            />

            <TextAreaField
              label="Parties Involved (Optional)"
              name="partiesInvolved"
              rows={2}
              placeholder="Names of accused, separated by commas (e.g. John Doe, Jane Smith)"
              value={formData.partiesInvolved}
              onChange={handleChange}
            />

            {/* Placeholder for evidence upload */}
            <div className="flex flex-col mb-4">
              <label className="mb-1.5 text-sm font-medium text-gray-900">Supporting Evidence (Optional)</label>
              <div className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative font-medium text-blue-600 bg-white rounded-md cursor-pointer hover:text-blue-500">
                      <span>{evidenceFile ? evidenceFile.name : 'Upload a file'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 mb-4 hover:cursor-pointer">
              <input 
                type="checkbox" 
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">Submit Anonymously</span>
            </label>

            <div className="pt-4 flex items-center justify-end border-t border-gray-100 gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
