import React from "react";
import { FlashcardList } from "../../views/pages/FlashCardPage";
import { ExploreCard, FlashcardExplore } from "./ExploreCard";
import { MyListCard } from "./MyListCard";


interface FlashcardCardProps {
  item: FlashcardList | FlashcardExplore;
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
  switch (type) {
    case "explore":
      return <ExploreCard item={item as FlashcardExplore} />;
    case "myList":
    default:
      return <MyListCard item={item as FlashcardList} onCreateCard={onCreateCard} onDelete={onDelete} />;
  }
};

export default FlashcardCard;
