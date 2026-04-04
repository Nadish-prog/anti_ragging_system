import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRoleRedirectPath } from '../../utils/roleRedirect'

export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth()

  if (!user || !user.role || !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to={getRoleRedirectPath(user?.role)} replace />
  }

  return children
}
