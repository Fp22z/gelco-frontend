import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../services/authService';
import { isTokenExpired } from '../../services/sessionService';

export default function PrivateRoute() {
  if (!isLoggedIn() || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
