import { ReactNode } from 'react';
import Navbar from '../../components/NavBar';
import Footer from '../../components/sections/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Navbar />
      <div className='pt-16'>{children}</div>
      <Footer />
    </>
  );
}

export default MainLayout;
