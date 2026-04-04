export const getRoleRedirectPath = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return '/student/dashboard'
    case 'faculty':
      return '/faculty/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/login'
  }
}
