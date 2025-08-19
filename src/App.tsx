import Navbar from './components/NavBar';
import Footer from './components/sections/Footer';
import LandingPage from './views/pages/LandingPage';

function App() {
  return (
    <>
      <Navbar />
      <div className='pt-16'>
        <LandingPage />
      </div>
      <Footer />
    </>
  );
}

export default App;
