import React from "react";
import { FlashcardList } from "../../views/pages/FlashCardPage";
import { ExploreCard, FlashcardExplore } from "./ExploreCard";
import { MyListCard } from "./MyListCard";
import MyLearningFlashcard, { LearningFlashcard } from "./LearningFlashcard";
import { flashCardProgressService } from "../../services/flashcard_progress.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";


interface FlashcardCardProps {
  item: FlashcardList | FlashcardExplore | LearningFlashcard;
  type?: "myList" | "explore" | "learning";
  onCreateCard?: () => void;
  onDelete?: (id: string) => void;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({
  item,
  type = "myList",
  onCreateCard,
  onDelete,
}) => {
  const navigate = useNavigate();
  switch (type) {
    case "learning":
      return <MyLearningFlashcard
        item={item as LearningFlashcard}
        onClick={(sessionId: string) => {
          localStorage.setItem("flashcard_session_id", sessionId);
          navigate(`/flash-cards/${(item as LearningFlashcard).topic._id}/practice`);
        }}
        onDelete={async () => {
          try {
            toast.promise(await flashCardProgressService.removeSession((item as LearningFlashcard).session_id), {
              loading: "Đang xóa phiên học...",
              success: () => {
                setTimeout(() => {
                  window.location.reload();
                }, 500);
                return "Xóa phiên học thành công!";
              },
              error: "Xóa phiên học thất bại. Vui lòng thử lại.",
            });
          } catch (error) {
            console.error("Error removing session:", error);
            toast.error("Xóa phiên học thất bại. Vui lòng thử lại.");
          }
        }} />;
    case "explore":
      return <ExploreCard item={item as FlashcardExplore} />;
    case "myList":
    default:
      return <MyListCard item={item as FlashcardList} onCreateCard={onCreateCard} onDelete={onDelete} />;
  }
};

export default FlashcardCard;
