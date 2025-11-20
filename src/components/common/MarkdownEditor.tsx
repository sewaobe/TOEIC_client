import { FC, useState, useEffect, useRef, useCallback } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor, useInstance } from "@milkdown/react";
import { getMarkdown } from "@milkdown/utils";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { toast } from "sonner";
import { CircularProgress } from "@mui/material";

interface MarkdownEditorProps {
  initialValue?: string;
  onSave?: (markdown: string, target: string) => void;
}

const MarkdownEditorImpl: FC<MarkdownEditorProps> = ({ initialValue, onSave }) => {
  // ========= State =========
  const [isSaving, setIsSaving] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");

  // ========= Refs =========
  const lastSavedContentRef = useRef(initialValue || "");
  const currentMarkdownRef = useRef(initialValue || "");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingMarkdownRef = useRef<string | null>(null);
  const editorRef = useRef<any>(null);

  // ========= Milkdown Editor =========
  useEditor(
    (root) =>
      new Crepe({
        root,
        defaultValue: initialValue || "",
      }),
    []
  );

  const [loading, getEditor] = useInstance();

  // ========= Setup editor ref =========
  useEffect(() => {
    if (loading) return;
    const editor = getEditor();
    if (!editor) return;

    editorRef.current = editor;
  }, [loading, getEditor]);

  // ========= Text Selection & Floating Toolbar =========
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();

    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorElement = document.querySelector(".markdown-editor");

      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect();
        setToolbarPos({
          top: rect.top - editorRect.top - 50,
          left: rect.left - editorRect.left + rect.width / 2 - 100,
        });
        setToolbarVisible(true);
      }
    } else {
      setToolbarVisible(false);
    }
  }, []);

  useEffect(() => {
    const editorElement = document.querySelector(".markdown-editor");
    if (!editorElement) return;

    editorElement.addEventListener("mouseup", handleTextSelection);
    editorElement.addEventListener("keyup", handleTextSelection);

    return () => {
      editorElement.removeEventListener("mouseup", handleTextSelection);
      editorElement.removeEventListener("keyup", handleTextSelection);
    };
  }, [handleTextSelection]);

  // ========= Core Save Logic =========
  const performSave = useCallback(
    async (markdown: string, showToast: boolean = true) => {
      if (markdown === lastSavedContentRef.current) {
        pendingMarkdownRef.current = null;
        return;
      }

      if (isSavingRef.current) {
        pendingMarkdownRef.current = markdown;
        return;
      }

      isSavingRef.current = true;
      setIsSaving(true);
      pendingMarkdownRef.current = null;

      try {
        await onSave?.(markdown, "");
        lastSavedContentRef.current = markdown;
      } catch (err) {
        console.error("Save error:", err);
        toast.error("Lỗi khi lưu");
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;

        if (pendingMarkdownRef.current && pendingMarkdownRef.current !== lastSavedContentRef.current) {
          setTimeout(() => {
            if (pendingMarkdownRef.current) {
              performSave(pendingMarkdownRef.current, false);
            }
          }, 100);
        }
      }
    },
    [onSave]
  );

  // ========= Auto-save với Debounce 2s =========
  useEffect(() => {
    if (loading) return;
    const editor = getEditor();
    if (!editor) return;

    editorRef.current = editor;

    const handleChange = () => {
      try {
        const markdown = editor.action(getMarkdown());
        currentMarkdownRef.current = markdown;
        pendingMarkdownRef.current = markdown;
      } catch (err) {
        console.error("Error getting markdown on change:", err);
      }

      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        try {
          const markdown = currentMarkdownRef.current;
          performSave(markdown, true);
        } catch (err) {
          console.error("Error in auto-save timeout:", err);
        }
      }, 2000);
    };

    const observer = new MutationObserver(handleChange);
    const editorElement = document.querySelector(".markdown-editor");
    if (editorElement) {
      observer.observe(editorElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      observer.disconnect();
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [loading, getEditor, performSave]);

  // ========= Force-save trước khi unmount =========
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      const pendingMarkdown = pendingMarkdownRef.current;
      const lastSaved = lastSavedContentRef.current;

      if (pendingMarkdown !== null && pendingMarkdown !== lastSaved) {
        try {
          const result = onSave?.(pendingMarkdown, "") as any;
          if (result && typeof result.then === "function") {
            result
              .then(() => {
                lastSavedContentRef.current = pendingMarkdown;
              })
              .catch((err: any) => {
                console.error("Force save on unmount error:", err);
              });
          } else {
            lastSavedContentRef.current = pendingMarkdown;
          }
        } catch (err) {
          console.error("Force save on unmount error:", err);
        }
      }
    };
  }, [onSave]);

  // ========= Ctrl+S Handler =========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (loading) return;

        const editor = getEditor();
        if (!editor) return;

        try {
          const markdown = editor.action(getMarkdown());
          if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
          }
          performSave(markdown, true);
        } catch (err) {
          console.error("Error handling Ctrl+S:", err);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, getEditor, performSave]);



  // ========= Render =========
  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Floating Toolbar */}
      {toolbarVisible && (
        <div
          className="fixed z-50 flex items-center gap-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
        >
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Highlight:</span>
          {[
            { color: "#FFFF00", name: "Yellow" },
            { color: "#FF6B6B", name: "Red" },
            { color: "#4ECDC4", name: "Cyan" },
            { color: "#95E1D3", name: "Green" },
            { color: "#FFE66D", name: "Orange" },
          ].map(({ color, name }) => (
            <button
              key={color}
              onClick={() => {
                if (!editorRef.current || !selectedText) return;

                try {
                  const selection = window.getSelection();
                  if (!selection) return;

                  const currentMarkdown = editorRef.current.action(getMarkdown());
                  const highlightMarkdown = `==${selectedText}==`;
                  const newMarkdown = currentMarkdown.replace(selectedText, highlightMarkdown);

                  currentMarkdownRef.current = newMarkdown;
                  pendingMarkdownRef.current = newMarkdown;

                  if (autoSaveTimeoutRef.current) {
                    clearTimeout(autoSaveTimeoutRef.current);
                  }
                  autoSaveTimeoutRef.current = setTimeout(() => {
                    performSave(newMarkdown, true);
                  }, 2000);

                  toast.success(`Highlighted with ${name}`);
                  setToolbarVisible(false);
                  selection.removeAllRanges();
                } catch (err) {
                  console.error("Error highlighting:", err);
                  toast.error("Lỗi khi highlight");
                }
              }}
              title={name}
              className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-600 transition"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      <div
        className="flex-1 overflow-auto markdown-editor mb-16"
        style={{
          scrollbarWidth: "none",      // Firefox
          msOverflowStyle: "none",     // IE/Edge
        }}
      >
        <style>{`
    .markdown-editor::-webkit-scrollbar { display: none; }
  `}</style>
        <Milkdown />
      </div>

    </div>
  );
};

export const MarkdownEditor: FC<MarkdownEditorProps> = (props) => {
  return (
    <MilkdownProvider>
      <MarkdownEditorImpl {...props} />
    </MilkdownProvider>
  );
};
