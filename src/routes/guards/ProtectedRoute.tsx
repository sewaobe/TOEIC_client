import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../stores/store';
import userService from '../../services/user.service';
import { User } from '../../types/user';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      userService
        .getCurrentUser()
        .then((data) => {
          //dispatch(setUser(data))
          console.log('User', data);
        })
        .catch((error) => {
          console.error('Error ProtectedRoute ', error);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);
  if (isLoading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
