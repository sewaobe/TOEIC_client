import { ReactNode } from 'react';
import Navbar from '../../components/common/NavBar';
import Footer from '../../components/sections/Footer';

interface LandingLayoutProps {
  children: ReactNode;
}

function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className='max-h-screen custom-scrollbar'>
      <Navbar />
      <div className='pt-16'>{children}</div>
      <Footer />
    </div>
  );
}

export default LandingLayout;
