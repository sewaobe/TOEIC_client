import { ReactNode, useState } from "react";
import Navbar from "../../components/common/NavBar";
import Footer from "../../components/sections/Footer";
import RightMenuDrawer from "../../components/common/RightMenu";
import StudyNotebookFlip3D from "../pages/NotebookPage";
import useTextSelection from "../../hooks/useTextSelection";
import HighlightPopup from "../../components/common/HighlightPopup";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { LearningProgressModal } from "../../components/modals/LearningProgressModal";
import { ChatbotDrawer } from "../../components/chatbot/ChatbotDrawer";
import ReportIssueModal from "../../components/modals/ReportIssueModal";
import DictionaryDrawer from "../../components/dictionary/DictionaryDrawer";
import CreateVocabularyModal from "../../components/modals/CreateVocabularyModal";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const highlightPopupEnabled = useSelector(
    (state: RootState) => state.highlightPopup.enabled
  );
  console.log("Highlight Popup Enabled:", highlightPopupEnabled);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showLearningProgress, setShowLearningProgress] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatDrawerQuestion, setChatDrawerQuestion] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreateVocabulary, setShowCreateVocabulary] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState("");
  const [notebookClipboard, setNotebookClipboard] = useState<string>("");

  const { selectedText, rect, clearSelection } = useTextSelection();

  const handleSaveNotebook = () => {
    console.log("📘 Save to notebook:", selectedText);
    // Lưu vào clipboard tạm
    setNotebookClipboard(selectedText);
    // Mở notebook trực tiếp
    setShowNotebook(true);
    clearSelection();
  };

  const handleSaveFlashcard = () => {
    console.log("🃏 Save to flashcard:", selectedText);
    setHighlightedWord(selectedText);
    setShowCreateVocabulary(true);
    clearSelection();
  };

  const handleAskAI = () => {
    setShowChatbot(true);
    setChatDrawerQuestion({ id: "", text: selectedText });
    clearSelection();
  };

  return (
    <div className="max-h-screen custom-scrollbar">
      <Navbar />
      <div className="pt-16">
        {children}
        {selectedText && rect && isAuthenticated && highlightPopupEnabled && (
          <HighlightPopup
            rect={rect}
            text={selectedText}
            onSaveNotebook={handleSaveNotebook}
            onSaveFlashcard={handleSaveFlashcard}
            onAskAI={handleAskAI}
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
            onShowReport={setShowReportModal}
            onShowDictionary={setShowDictionary}
          />
          <StudyNotebookFlip3D
            isOpen={showNotebook}
            onClose={() => {
              setShowNotebook(false);
              // Clear clipboard khi đóng
              setNotebookClipboard("");
            }}
            clipboardText={notebookClipboard}
          />
          <LearningProgressModal
            isFirstVisitToday={showLearningProgress}
            setIsFirstVisitToday={setShowLearningProgress}
          />
          <ChatbotDrawer
            isOpen={showChatbot}
            onClose={() => setShowChatbot(false)}
            initialQuestion={chatDrawerQuestion || undefined}
          />
          <ReportIssueModal
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
          />
          <DictionaryDrawer
            open={showDictionary}
            onClose={() => setShowDictionary(false)}
          />
          <CreateVocabularyModal
            open={showCreateVocabulary}
            onClose={() => {
              setShowCreateVocabulary(false);
              setHighlightedWord("");
            }}
            initialWord={highlightedWord}
          />
        </>
      )}
    </div>
  );
}

export default MainLayout;
