import { api } from './api'

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  register: async (userData) => {
    // Map string roles to expected DB IDs (Assuming 1=Student, 2=Faculty, 3=Admin)
    const roleMap = { student: 1, faculty: 2, admin: 3 }
    
    const payload = {
      full_name: userData.name,
      email: userData.email,
      password: userData.password,
      role_id: roleMap[userData.role] || 1,
      phone_no: userData.phone_no,
      department_id: userData.department_id ? parseInt(userData.department_id, 10) : null,
      roll_no: userData.roll_no,
      faculty_code: userData.faculty_code,
      year: userData.year,
    }
    const response = await api.post('/auth/register', payload)
    return response.data
  },
  
  // Example for future use if needed to verify token validity on mount
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}
