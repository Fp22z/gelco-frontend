import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../services/authService';

export default function PrivateRoute() {
  // TEMP: remove for production
  // if (!isLoggedIn()) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}
