import { ReactNode, useState } from 'react';
import Navbar from '../../components/common/NavBar';
import Footer from '../../components/sections/Footer';
import RightMenuDrawer from '../../components/common/RightMenu';
import StudyNotebookFlip3D from '../pages/NotebookPage';
import useTextSelection from '../../hooks/useTextSelection';
import HighlightPopup from '../../components/common/HighlightPopup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../stores/store';
import { showSnackbar } from '../../stores/snackbarSlice';
import { LearningProgressModal } from '../../components/modals/LearningProgressModal';
import { ChatbotDrawer } from '../../components/chatbot/ChatbotDrawer';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showLearningProgress, setShowLearningProgress] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

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
    <div className='max-h-screen custom-scrollbar'>
      <Navbar />
      <div className='pt-16'>
        {children}
        {selectedText && rect && isAuthenticated && (
          <HighlightPopup
            rect={rect}
            text={selectedText}
            onSaveNotebook={handleSaveNotebook}
            onSaveFlashcard={handleSaveFlashcard}
          />
        )}
      </div>
      <Footer />
      {isAuthenticated && (
        <>
          <RightMenuDrawer
            onShowNotebook={setShowNotebook}
            onShowProgress={setShowLearningProgress}
            onShowChatbot={setShowChatbot}
          />
          <StudyNotebookFlip3D
            isOpen={showNotebook}
            onClose={() => setShowNotebook(false)}
          />
          <LearningProgressModal
            isFirstVisitToday={showLearningProgress}
            setIsFirstVisitToday={setShowLearningProgress}
          />
          <ChatbotDrawer
            isOpen={showChatbot}
            onClose={() => setShowChatbot(false)}
          />
        </>
      )}
    </div>
  );
}

export default MainLayout;
