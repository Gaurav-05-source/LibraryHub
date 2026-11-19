
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ allowedRole }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={
          user.role === 'ADMIN'
            ? '/admin/dashboard'
            : '/member/dashboard'
        }
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
