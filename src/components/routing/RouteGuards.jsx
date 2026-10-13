import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

// Layout routes that gate their child routes on the persisted session. The
// auth store hydrates synchronously from localStorage, so there is no loading
// state to wait for before deciding.

// Account pages: anonymous visitors go to the login page.
export function AuthRoute() {
  const isLoggedIn = useAuthStore((state) => Boolean(state.token));

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Admin pages: anonymous visitors go to the login page, logged-in users
// without the admin role go to the home page.
export function AdminRoute() {
  const isLoggedIn = useAuthStore((state) => Boolean(state.token));
  const isAdmin = useAuthStore((state) => state.isAdmin);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
