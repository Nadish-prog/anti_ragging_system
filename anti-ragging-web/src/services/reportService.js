import { api } from './api'

// Helper to map backend complaint format to frontend expected format
const mapComplaint = (c) => {
  if (!c) return null;
  return {
    ...c,
    id: c.complaint_id,
    createdAt: c.created_at,
    incidentDate: c.incident_date,
    status: c.status || c.complaint_status?.status_name?.toLowerCase() || 'pending',
    severity: c.severity_levels?.level_name,
    incidentType: c.incident_types?.type_name || c.incident_type,
    isAnonymous: c.is_anonymous,
    student: c.student_info || c.users_complaints_student_idTousers ? {
      name: c.student_info?.full_name || c.users_complaints_student_idTousers?.full_name,
      email: c.student_info?.email || c.users_complaints_student_idTousers?.email || '',
      phone: c.student_info?.phone_no || c.users_complaints_student_idTousers?.phone_no || '',
      rollNo: c.student_info?.roll_no || c.users_complaints_student_idTousers?.roll_no || '',
      departmentId: c.student_info?.department_id || c.users_complaints_student_idTousers?.department_id || '',
      year: c.student_info?.year || c.users_complaints_student_idTousers?.year || ''
    } : null,
    faculty: c.assigned_faculty || c.users_complaints_assigned_faculty_idTousers ? {
        name: c.assigned_faculty?.name || c.users_complaints_assigned_faculty_idTousers?.full_name,
        email: c.assigned_faculty?.email || c.users_complaints_assigned_faculty_idTousers?.email || '',
        phone: c.assigned_faculty?.phone_no || c.users_complaints_assigned_faculty_idTousers?.phone_no || '',
        departmentId: c.assigned_faculty?.department_id || c.users_complaints_assigned_faculty_idTousers?.department_id || '',
        facultyCode: c.assigned_faculty?.faculty_code || c.users_complaints_assigned_faculty_idTousers?.faculty_code || ''
    } : null,
    facultyId: c.assigned_faculty_id || c.users_complaints_assigned_faculty_idTousers?.user_id,
    remarks: c.final_remark || '',
    accused: c.complaint_accused || c.accused || [],
    evidence: c.evidence || []
  }
}

export const reportService = {
  // Common/Student endpoints
  createReport: async (reportData) => {
    // Backend expects JSON: title, description, incident_type_id, location, incident_date, parties_involved, is_anonymous
    const payload = {
      title: reportData.title,
      description: reportData.description,
      location: reportData.location || null,
      incident_date: reportData.incidentDate || null,
      incident_type_id: parseInt(reportData.incidentTypeId),
      is_anonymous: reportData.isAnonymous || false,
      parties_involved: reportData.partiesInvolved || []
    }
    const response = await api.post('/complaints', payload)
    return response.data
  },

  uploadEvidence: async (complaintId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    
    // Using native fetch instead of global Axios instance to avoid Content-Type override
    const response = await fetch(`${baseURL}/complaints/${complaintId}/evidence`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type here; fetch will automatically set it with the correct boundary
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to upload evidence')
    }
    
    return response.json()
  },
  
  getMyReports: async () => {
    const response = await api.get('/complaints/my-complaints')
    const complaints = response.data.complaints || []
    return { complaints: complaints.map(mapComplaint) }
  },
  
  getReportDetails: async (id, role = 'admin') => {
    try {
        // Admin has a direct endpoint
        const response = await api.get(`/complaints/getComplaintById/${id}`)
        return { complaint: mapComplaint(response.data.complaint) }
    } catch (err) {
        // Fallback for students and faculty if they get 403 or if we want to simulate
        if (err.response?.status === 403 || err.response?.status === 404) {
            // Try fetching from lists
            const myReports = await reportService.getMyReports().catch(() => ({complaints: []}))
            const assigned = await reportService.getAssignedReports().catch(() => ({complaints: []}))
            const all = [...myReports.complaints, ...assigned.complaints]
            const found = all.find(c => c.id.toString() === id.toString())
            if (found) return { complaint: found }
        }
        throw err;
    }
  },

  // Faculty endpoints
  getAssignedReports: async () => {
    const response = await api.get('/complaints/getAssignedComplaints')
    const complaints = response.data.complaints || []
    return { complaints: complaints.map(mapComplaint) }
  },
  
  updateReportStatus: async (id, statusData) => {
    // Backend has two specific endpoints: /complaints/:id/close (Faculty) and /complaints/:id/reject (Admin)
    const { status, remarks, severityId } = statusData;
    if (status === 'resolved' || status === 'closed') {
       const response = await api.patch(`/complaints/${id}/close`, { final_remark: remarks })
       return response.data;
    } else if (status === 'rejected') {
       let payload = { reason: remarks };
       if (severityId) payload.severity_id = parseInt(severityId);
       const response = await api.patch(`/complaints/${id}/reject`, payload)
       return response.data;
    } else {
        throw new Error("Backend only supports closing or rejecting complaints directly.");
    }
  },

  // Admin endpoints
  getAllReports: async (filters = {}) => {
    const response = await api.get('/complaints/all', { params: filters })
    const complaints = response.data.complaints || []
    return { complaints: complaints.map(mapComplaint) }
  },
  
  assignFaculty: async (id, facultyId, severityId) => {
    // Backend expects PATCH /:id/assign with { faculty_id, severity_id }
    let payload = { faculty_id: parseInt(facultyId) };
    if (severityId) payload.severity_id = parseInt(severityId);
    const response = await api.patch(`/complaints/${id}/assign`, payload)
    return response.data
  },

  getAllUsers: async () => {
    // The backend does not currently have a "getAllUsers" route except possibly via search.
    // Assuming search without query might return some, or we just return empty to prevent crash.
    try {
        const response = await api.get('/users/search?q=')
        return { users: response.data.users || [] }
    } catch {
        return { users: [] }
    }
  },
  
  getFacultyMembers: async () => {
    try {
        const response = await api.get('/users/faculty')
        const facultyList = response.data.faculty || []
        return { 
          faculty: facultyList.map(f => ({
            id: f.user_id,
            name: f.full_name,
            email: f.email,
            departmentId: f.department_id,
            facultyCode: f.faculty_code
          })) 
        }
    } catch (err) {
        console.error("Failed to fetch faculty members", err);
        return { faculty: [] }
    }
  }
}
