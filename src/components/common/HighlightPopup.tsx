import React from "react";
import BookIcon from "@mui/icons-material/Book";
import StyleIcon from "@mui/icons-material/Style";

interface HighlightPopupProps {
  rect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
  text: string;
  onSaveNotebook: () => void;
  onSaveFlashcard: () => void;
  gap?: number; // khoảng cách giữa popup và text, mặc định 10px
}

const HighlightPopup: React.FC<HighlightPopupProps> = ({
  rect,
  text,
  onSaveNotebook,
  onSaveFlashcard,
  gap = 10,
}) => {
  // Chặn popup vượt khỏi mép trái/phải viewport
  const left = Math.min(
    window.innerWidth - 12,
    Math.max(12, rect.left)
  );

  return (
    <div
      role="toolbar"
      className="
        fixed z-[3000] flex items-center rounded-xl bg-white shadow-lg border
        divide-x divide-gray-200
        after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2
        after:border-8 after:border-transparent after:border-t-white
      "
      style={{
        top: rect.top,        // luôn neo theo đỉnh selection
        left,                 // đã clamp để không vượt mép
        transform: `translate(-100%, calc(-100% - ${gap}px))`, // đẩy lên phía trên
      }}
    >
      {/* Notebook */}
      <button
        onClick={onSaveNotebook}
        className="relative group flex items-center gap-1 px-3 py-2 hover:bg-gray-50"
        aria-label="Save to Notebook"
      >
        <BookIcon fontSize="small" className="text-indigo-600" />
        <span className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white">
          Notebook
        </span>
      </button>

      {/* Flashcard */}
      <button
        onClick={onSaveFlashcard}
        className="relative group flex items-center gap-1 px-3 py-2 hover:bg-gray-50"
        aria-label="Save to Flashcard"
      >
        <StyleIcon fontSize="small" className="text-rose-600" />
        <span className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white">
          Flashcard
        </span>
      </button>
    </div>
  );
};

export default HighlightPopup;
