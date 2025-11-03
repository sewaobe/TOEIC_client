import React, { useMemo, useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { createPortal } from "react-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import { MarkdownEditor } from "../../components/common/MarkdownEditor";

// ========= Types =========
interface LessonEntry {
  id: string;
  title: string;
  dateISO: string;
}

// ========= Helpers =========
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type HeadingNode = {
  id: string;
  text: string;
  level: number;
  children: HeadingNode[];
};

function extractHeadingsTree(markdown: string): HeadingNode[] {
  const regex = /^(#{1,6})\s+(.*)$/gm;
  const stack: HeadingNode[] = [];
  const root: HeadingNode[] = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length; // số lượng dấu #
    const text = match[2].trim();
    const id = "heading-" + text.toLowerCase().replace(/\s+/g, "-");

    const node: HeadingNode = { id, text, level, children: [] };

    // Tìm parent theo level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return root;
}

const HeadingTree: React.FC<{
  nodes: HeadingNode[];
  onJump: (id: string) => void;
}> = ({ nodes, onJump }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className="pl-2 space-y-1">
      {nodes.map((h) => (
        <li key={h.id}>
          <div className="flex items-center gap-1">
            {h.children.length > 0 && (
              <button
                onClick={() => toggle(h.id)}
                className="p-0.5 text-gray-500 hover:text-indigo-600"
              >
                {expanded[h.id] ? "▼" : "▶"}
              </button>
            )}
            <span
              onClick={() => onJump(h.id)}
              className="cursor-pointer hover:text-indigo-600 text-xs"
            >
              {h.text}
            </span>
          </div>
          {h.children.length > 0 && expanded[h.id] && (
            <HeadingTree nodes={h.children} onJump={onJump} />
          )}
        </li>
      ))}
    </ul>
  );
};

// ========= Sidebar =========
const Sidebar: React.FC<{
  lessons: LessonEntry[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  onAdd: () => void;
  notes: Record<string, string>;
  onJumpToHeading: (id: string) => void;
}> = ({ lessons, activeId, setActiveId, onAdd, notes, onJumpToHeading }) => {
  const [query, setQuery] = useState("");
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? lessons.filter((l) => l.title.toLowerCase().includes(q)) : lessons;
  }, [lessons, query]);

  const handleOpenMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuOpenId(id);
    setMenuPos({ top: rect.bottom + 4, left: rect.left });
  };

  return (
    <aside className="h-full w-full max-w-xs border-r bg-white/90 backdrop-blur-sm">
      {/* header */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <LibraryBooksIcon className="h-4 w-4" />
          <span className="font-semibold">Lessons</span>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <AddIcon className="h-4 w-4" /> New
        </button>
      </div>

      {/* search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5">
          <SearchIcon className="h-4 w-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lesson title..."
            className="w-full text-sm outline-none"
          />
        </div>
      </div>

      {/* list */}
      <div className="flex max-h-[calc(100vh-140px)] flex-col gap-2 overflow-auto px-2 pb-3">
        {filtered.map((l) => {
          const isActive = activeId === l.id;
          const isExpanded = expandedLessonId === l.id;

          const markdown = notes[l.id] || "";
          const headingsTree = extractHeadingsTree(markdown);

          return (
            <div
              key={l.id}
              className="rounded-xl border bg-white shadow-sm overflow-visible"
            >
              {/* Row chính */}
              <div
                className={`flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-gray-50 ${isActive ? "bg-gray-100" : ""
                  }`}
                onClick={() => setActiveId(l.id)}
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedLessonId(isExpanded ? null : l.id);
                    }}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </button>
                  <div>
                    <div className="truncate text-sm font-medium">{l.title}</div>
                    <div className="truncate text-xs text-gray-500">
                      {fmtDate(l.dateISO)}
                    </div>
                  </div>
                </div>

                {/* Nút 3 chấm */}
                <button
                  onClick={(e) => handleOpenMenu(e, l.id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <MoreVertIcon fontSize="small" />
                </button>
              </div>

              {/* mục lục khi expand */}
              {isExpanded && (
                <div className="pl-8 pb-2 space-y-1 text-xs text-gray-600">
                  {headingsTree.length === 0 ? (
                    <div className="text-gray-400 italic">No headings</div>
                  ) : (
                    <HeadingTree nodes={headingsTree} onJump={onJumpToHeading} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Portal menu */}
      {menuOpenId &&
        menuPos &&
        createPortal(
          <div
            className="absolute z-[9999] w-32 rounded-lg border bg-white shadow-lg"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              className="block w-full px-3 py-1 text-left text-sm hover:bg-gray-100"
              onClick={() => {
                setMenuOpenId(null);
                alert(`Export lesson ${menuOpenId}`);
              }}
            >
              Export
            </button>
            <button
              className="block w-full px-3 py-1 text-left text-sm hover:bg-gray-100"
              onClick={() => {
                setMenuOpenId(null);
                alert(`Import to lesson ${menuOpenId}`);
              }}
            >
              Import
            </button>
            <button
              className="block w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-gray-100"
              onClick={() => {
                setMenuOpenId(null);
                alert(`Delete lesson ${menuOpenId}`);
              }}
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </aside>
  );
};


// ========= Notebook Page =========
const NotebookPage: React.FC<{
  lesson: LessonEntry;
  onEditTitle: (title: string) => void;
  content: string;
}> = ({ lesson, onEditTitle, content }) => {
  return (
    <div
      className="relative mx-auto w-full max-w-4xl rounded-[28px] border bg-white shadow-xl p-6 overflow-y-auto h-full"
    >
      {/* cho phép đổi tên bài học */}
      <input
        className="mb-4 w-full rounded-xl border-0 bg-transparent text-lg font-bold outline-none"
        value={lesson.title}
        onChange={(e) => onEditTitle(e.target.value)}
      />

      {/* Editor thay thế phần hiển thị markdown thuần */}
      <MarkdownEditor
        initialValue={content || "# Gõ thử đi 🚀"}
        onSave={(markdown, target) => {
          console.log("Lưu note:", markdown, "vào", target);
        }}
      />
    </div>
  );
};

// ========= Main =========
export default function StudyNotebookFlip3D({
  isOpen,
  onClose,
  clipboardText = "",
}: {
  isOpen: boolean;
  onClose?: () => void;
  clipboardText?: string;
}) {
  const [notes, setNotes] = useLocalStorage<Record<string, string>>(
    "markdown_notes",
    {
      lesson1:
        "# Ghi chú ban đầu\n\nBạn có thể chỉnh sửa nội dung này bằng Markdown.\n\n* Ghi chú quan trọng 1\n\n* Ghi chú quan trọng 2\n\n* Ghi chu\n\n",
    }
  );

  // lessons sẽ sinh từ notes keys
  const [lessons, setLessons] = useState<LessonEntry[]>([]);
  const [showClipboardToast, setShowClipboardToast] = useState(false);

  useEffect(() => {
    const arr = Object.keys(notes).map((key) => ({
      id: key,
      title: key, // 👈 hiển thị key làm title (lesson1, lesson2, …)
      dateISO: new Date().toISOString(),
    }));
    setLessons(arr);
  }, [notes]);

  // Hiển thị toast khi có clipboard text
  useEffect(() => {
    if (clipboardText && isOpen) {
      setShowClipboardToast(true);
    } else {
      setShowClipboardToast(false);
    }
  }, [clipboardText, isOpen]);

  useEffect(() => {
    // Tìm đến thẻ <html>
    const htmlElement = document.documentElement;

    if (isOpen) {
      // Khi modal mở, thêm class
      htmlElement.classList.add('lock-action');
    }

    // --- Hàm dọn dẹp (Cleanup Function) ---
    // Hàm này sẽ chạy khi modal đóng
    return () => {
      // Xóa class đi để trả lại scroll cho trang
      htmlElement.classList.remove('lock-action');
    };

  }, [isOpen]); // useEffect sẽ chạy lại mỗi khi isOpen thay đổi
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const active = useMemo(
    () => lessons.find((l) => l.id === activeId) || null,
    [lessons, activeId]
  );

  const addLesson = () => {
    const id = `lesson${Object.keys(notes).length + 1}`;
    setNotes({ ...notes, [id]: "# New Lesson" });
    setActiveId(id);
  };

  const editTitle = (title: string) => {
    if (!active) return;
    setLessons((prev) =>
      prev.map((l) => (l.id === active.id ? { ...l, title } : l))
    );
  };

  const handleJumpToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePasteClipboard = () => {
    if (!clipboardText || !active) return;
    
    const timestamp = new Date().toLocaleString();
    const formattedContent = `\n\n---\n\n> **Highlighted on ${timestamp}**\n> \n> ${clipboardText.split("\n").join("\n> ")}\n\n`;
    
    const currentContent = notes[active.id] || "";
    setNotes({
      ...notes,
      [active.id]: currentContent + formattedContent,
    });
    
    setShowClipboardToast(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative z-[2001] bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isMaximized
            ? "w-screen h-screen max-w-none max-h-none rounded-none"
            : "w-[90%] h-[85%] max-w-6xl max-h-[750px] rounded-3xl"
          }`}
      >
        <header className="flex items-center justify-between p-3 border-b bg-white/90 backdrop-blur shrink-0">
          <h1 className="text-lg font-bold">TOEIC Study Notebook</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMaximized((v) => !v)}
              className="rounded-2xl border px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            >
              {isMaximized ? (
                <>
                  <CloseFullscreenIcon fontSize="small" />
                  Restore
                </>
              ) : (
                <>
                  <OpenInFullIcon fontSize="small" />
                  Maximize
                </>
              )}
            </button>

            <button
              onClick={addLesson}
              className="rounded-2xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              New Lesson
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-2xl border px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            )}
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[1fr_2fr] overflow-hidden">
          <Sidebar
            lessons={lessons}
            activeId={activeId}
            setActiveId={setActiveId}
            onAdd={addLesson}
            notes={notes}
            onJumpToHeading={handleJumpToHeading}
          />
          <main className="p-2 overflow-y-auto relative">
            {!active ? (
              <div className="mx-auto max-w-3xl rounded-3xl border bg-white/70 p-8 text-center text-gray-600">
                Chọn hoặc tạo một mục để bắt đầu viết.
              </div>
            ) : (
              <NotebookPage
                lesson={active}
                onEditTitle={editTitle}
                content={notes[active.id] || ""}
              />
            )}

            {/* Clipboard Toast - Floating notification */}
            {showClipboardToast && clipboardText && (
              <div className="fixed bottom-6 right-6 z-[2010] max-w-md animate-slide-up">
                <div className="rounded-2xl bg-white shadow-2xl border-2 border-indigo-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-semibold text-sm">Nội dung đã sao chép</span>
                    </div>
                    <button
                      onClick={() => setShowClipboardToast(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Content Preview */}
                  <div className="p-4 bg-gray-50 border-b">
                    <p className="text-xs text-gray-500 mb-1">Nội dung:</p>
                    <div className="text-sm text-gray-700 italic line-clamp-3 bg-white p-2 rounded border">
                      "{clipboardText}"
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-white flex gap-2">
                    <button
                      onClick={handlePasteClipboard}
                      disabled={!active}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {active ? "Paste vào mục này" : "Chọn mục trước"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

