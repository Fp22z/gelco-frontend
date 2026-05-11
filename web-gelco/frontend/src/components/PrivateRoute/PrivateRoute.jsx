import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../services/authService';

export default function PrivateRoute() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
