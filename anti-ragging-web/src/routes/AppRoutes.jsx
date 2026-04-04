import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { RoleBasedRoute } from '../components/layout/RoleBasedRoute'
import { DashboardLayout } from '../components/layout/DashboardLayout'

// Public Pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import NotFound from '../pages/auth/NotFound'

// Shared Pages
import Profile from '../pages/shared/Profile'

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard'
import MyReports from '../pages/student/MyReports'
import CreateReport from '../pages/student/CreateReport'
import ReportDetails from '../pages/student/ReportDetails'

// Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard'
import AssignedReports from '../pages/faculty/AssignedReports'
import FacultyReportDetails from '../pages/faculty/FacultyReportDetails'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AllReports from '../pages/admin/AllReports'
import AdminReportDetails from '../pages/admin/AdminReportDetails'
import AdminAnalytics from '../pages/admin/AdminAnalytics'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          {/* Student Routes */}
          <Route path="/student" element={<RoleBasedRoute allowedRoles={['student']}><Outlet /></RoleBasedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="reports" element={<MyReports />} />
            <Route path="reports/create" element={<CreateReport />} />
            <Route path="reports/:id" element={<ReportDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<RoleBasedRoute allowedRoles={['faculty']}><Outlet /></RoleBasedRoute>}>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="assigned" element={<AssignedReports />} />
            <Route path="assigned/:id" element={<FacultyReportDetails />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<RoleBasedRoute allowedRoles={['admin']}><Outlet /></RoleBasedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<AllReports />} />
            <Route path="reports/:id" element={<AdminReportDetails />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>

        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
