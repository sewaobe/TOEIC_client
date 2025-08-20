import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAdmin = localStorage.getItem('role') === 'admin';
  return isAdmin ? <>{children}</> : <Navigate to='/unauthorized' replace />;
};

export default AdminRoute;
