import { Route, Routes } from 'react-router-dom';
import privateRoutes from './routeConfig/privateRoutes';
import publicRoutes from './routeConfig/publicRoutes';
import { RouteWrapper } from './guards/RouteWrapper';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

export const AppRouter = () => {
  return (
    <>
      <Toaster position='top-right' richColors />
      <Suspense fallback={<div>Loading....</div>}>
        <Routes>
          {publicRoutes.map(({ path, element: Element, guard: Guard }) => (
            <Route
              key={path}
              path={path}
              element={<RouteWrapper element={Element} guard={Guard} />}
            />
          ))}

          {privateRoutes.map(({ path, element: Element, guard: Guard }) => (
            <Route
              key={path}
              path={path}
              element={<RouteWrapper element={Element} guard={Guard} />}
            />
          ))}

          {/* <Route path='*' element={<Navigate to='/' replace />} /> */}
        </Routes>
      </Suspense>
    </>
  );
};
