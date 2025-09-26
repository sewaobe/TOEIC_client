import { useState, useEffect } from "react";

interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export default function useTextSelection() {
  const [selectedText, setSelectedText] = useState("");
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectedText("");
        setRect(null);
        return;
      }

      const text = selection.toString();
      if (text.trim() === "") return;

      const range = selection.getRangeAt(0);
      const bounding = range.getBoundingClientRect();

      setSelectedText(text);
      setRect({
        top: bounding.top + window.scrollY,
        left: bounding.left + bounding.width / 2,
        bottom: bounding.bottom + window.scrollY,
        right: bounding.right,
        width: bounding.width,
        height: bounding.height,
      });
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const clearSelection = () => {
    setSelectedText("");
    setRect(null);
    window.getSelection()?.removeAllRanges();
  };

  return { selectedText, rect, clearSelection };
}
