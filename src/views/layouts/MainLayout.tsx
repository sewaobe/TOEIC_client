import { ReactNode, useEffect, useState } from "react";
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
import { AdjustmentRequestDialog } from "../../components/modals/AdjustmentRequestDialog";
import { useAdjustmentSocket } from "../../hooks/useAdjustmentSocket";
import { AdjustmentProvider } from "../../contexts/AdjustmentContext";

interface MainLayoutProps {
  children: ReactNode;
}

export interface QuickQuestionExplainRequest {
  requestId: string;
  testId: string;
  attemptId: string;
  questionId: string;
  questionNumber?: number;
  textPreview?: string;
  testTitle?: string;
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
  const [quickQuestionRequest, setQuickQuestionRequest] =
    useState<QuickQuestionExplainRequest | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreateVocabulary, setShowCreateVocabulary] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState("");
  const [notebookClipboard, setNotebookClipboard] = useState<string>("");

  const { selectedText, rect, clearSelection } = useTextSelection();

  // Quản lý adjustment dialog (không còn auto-popup)
  const { pendingRequest, showDialog, closeDialog, openDialogWithRequest } =
    useAdjustmentSocket();

  const handleAdjustmentResponded = () => {
    // Callback sau khi học viên phản hồi
    closeDialog();
  };

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
    setQuickQuestionRequest(null);
    setShowChatbot(true);
    setChatDrawerQuestion({ id: "", text: selectedText });
    clearSelection();
  };

  useEffect(() => {
    const handleQuickQuestionExplain = (event: Event) => {
      const detail = (event as CustomEvent<Partial<QuickQuestionExplainRequest>>).detail;
      if (!detail?.testId || !detail.attemptId || !detail.questionId) return;

      setChatDrawerQuestion(null);
      setQuickQuestionRequest({
        requestId: detail.requestId || `${Date.now()}-${detail.questionId}`,
        testId: detail.testId,
        attemptId: detail.attemptId,
        questionId: detail.questionId,
        questionNumber: detail.questionNumber,
        textPreview: detail.textPreview,
        testTitle: detail.testTitle,
      });
      setShowChatbot(true);
    };

    window.addEventListener("chatbot:quick-question-explain", handleQuickQuestionExplain);
    return () => {
      window.removeEventListener("chatbot:quick-question-explain", handleQuickQuestionExplain);
    };
  }, []);

  return (
    <AdjustmentProvider openDialogWithRequest={openDialogWithRequest}>
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
              onClose={clearSelection}
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
              quickQuestionRequest={quickQuestionRequest || undefined}
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
            <AdjustmentRequestDialog
              open={showDialog}
              onClose={closeDialog}
              request={pendingRequest}
              onResponded={handleAdjustmentResponded}
            />
          </>
        )}
      </div>
    </AdjustmentProvider>
  );
}

export default MainLayout;
