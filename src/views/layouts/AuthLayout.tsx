// src/layouts/AuthLayout.tsx
import { FC, ReactNode } from 'react';

interface AuthLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export const AuthLayout: FC<AuthLayoutProps> = ({ left, right }) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='relative w-[900px] h-[550px] bg-white shadow-xl rounded-2xl overflow-hidden flex'>
        {left}
        {right}
      </div>
    </div>
  );
};
