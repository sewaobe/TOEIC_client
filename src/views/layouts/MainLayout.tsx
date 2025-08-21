import { ReactNode } from 'react';
import Navbar from '../../components/NavBar';
import Footer from '../../components/sections/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='custom-scrollbar'>
      <Navbar />
      <div className='pt-16'>{children}</div>
      <Footer />
    </div>
  );
}

export default MainLayout;
