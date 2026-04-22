import { Navigate } from 'react-router-dom';
import { ReactNode} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import RouteLoadingFallback from '../../components/common/RouteLoadingFallback';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, initialized } = useSelector((state: RootState) => state.user);
  
  if(!initialized) {
    return <RouteLoadingFallback message='Loading...' />;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
