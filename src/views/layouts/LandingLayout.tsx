import { ReactNode } from 'react';
import Footer from '../../components/sections/Footer';
import LandingNavbar from '../../components/common/LandingNavbar';

interface LandingLayoutProps {
  children: ReactNode;
}

function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className='max-h-screen custom-scrollbar'>
      <LandingNavbar />
      <div className='pt-16'>{children}</div>
      <Footer />
    </div>
  );
}

export default LandingLayout;
