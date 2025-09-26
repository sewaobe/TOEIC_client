import { ReactNode, useState } from 'react';
import Navbar from '../../components/common/NavBar';
import Footer from '../../components/sections/Footer';
import RightMenuDrawer from '../../components/common/RightMenu';
import StudyNotebookFlip3D from '../pages/NotebookPage';
import useTextSelection from '../../hooks/useTextSelection';
import HighlightPopup from '../../components/common/HighlightPopup';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../stores/store';
import { showSnackbar } from '../../stores/snackbarSlice';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [showNotebook, setShowNotebook] = useState(false);
  const { selectedText, rect, clearSelection } = useTextSelection();
  const dispatch = useDispatch<AppDispatch>();
  const handleSaveNotebook = () => {
    console.log("📘 Save to notebook:", selectedText);
    dispatch(showSnackbar({ message: 'Save to notebook successfully!', severity: 'success' }))
    clearSelection();
  };

  const handleSaveFlashcard = () => {
    console.log("🃏 Save to flashcard:", selectedText);
    dispatch(showSnackbar({ message: 'Save to flash card successfully!', severity: 'success' }))
    clearSelection();
  };

  return (
    <div>
      <Navbar />
      <div className='pt-16'>
        {children}
        {selectedText && rect && (
          <HighlightPopup
            rect={rect}
            text={selectedText}
            onSaveNotebook={handleSaveNotebook}
            onSaveFlashcard={handleSaveFlashcard}
          />
        )}
      </div>
      <Footer />
      <RightMenuDrawer setShowNotebook={setShowNotebook} />
      <StudyNotebookFlip3D isOpen={showNotebook} onClose={() => setShowNotebook(false)} />
    </div>
  );
}

export default MainLayout;
