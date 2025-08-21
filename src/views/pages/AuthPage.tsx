// src/pages/LoginPage.tsx
import { FC, useState } from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { AnimatePresence, motion } from 'framer-motion';

import LoginForm from '../../components/auths/LoginForm';
import RegisterForm from '../../components/auths/RegisterForm';

import loginImage from '../../assets/LoginImage.jpg';
import registerImage from '../../assets/RegisterImage.jpg';

const AuthPage: FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout
      left={
        <div className='w-1/2 flex items-center justify-center relative overflow-hidden'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={isLogin ? 'login-form' : 'register-form'}
              initial={{ x: isLogin ? -400 : 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isLogin ? 400 : -400, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className='absolute w-full h-full flex items-center justify-center p-6'
            >
              {isLogin ? (
                <LoginForm onSwitch={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onSwitch={() => setIsLogin(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      }
      right={
        <div className='w-1/2 relative overflow-hidden'>
          <AnimatePresence mode='wait'>
            <motion.img
              key={isLogin ? 'login-img' : 'register-img'}
              src={isLogin ? loginImage : registerImage}
              alt='Auth Banner'
              initial={{ x: isLogin ? 400 : -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isLogin ? -400 : 400, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className='absolute w-full h-full object-cover'
            />
          </AnimatePresence>
        </div>
      }
    />
  );
};

export default AuthPage;
