import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LaunchIcon from "@mui/icons-material/Launch";
import MenuIcon from "@mui/icons-material/Menu";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { createPortal } from "react-dom";
import { MarkdownEditor } from "../../components/common/MarkdownEditor";
import { user_note_service } from "../../services/user_note.service";
import { User_Note } from "../../types/User_Note";
import { useDebounce } from "../../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import MindMapVisualization, { MindMapRef } from "../../components/notebook/MindMapVisualization";
import { MindMapNode, MindMapStorage } from "../../types/MindMap";
import geminiService from "../../services/gemini.service";

// ========= Types =========
type LessonEntry = User_Note;

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
    const id = text.toLowerCase().replace(/\s+/g, "-");

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

// ========= MindMap localStorage Helpers =========
const MINDMAP_STORAGE_KEY = "notebook_mindmaps";

function getMindMapFromStorage(noteId: string): MindMapNode | null {
  try {
    const stored = localStorage.getItem(MINDMAP_STORAGE_KEY);
    if (!stored) return null;
    const data: MindMapStorage = JSON.parse(stored);
    return data[noteId]?.mindMap || null;
  } catch {
    return null;
  }
}

function saveMindMapToStorage(noteId: string, mindMap: MindMapNode): void {
  try {
    const stored = localStorage.getItem(MINDMAP_STORAGE_KEY);
    const data: MindMapStorage = stored ? JSON.parse(stored) : {};
    data[noteId] = {
      mindMap,
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem(MINDMAP_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save mindmap to storage:", e);
  }
}

function hasMindMapInStorage(noteId: string): boolean {
  try {
    const stored = localStorage.getItem(MINDMAP_STORAGE_KEY);
    if (!stored) return false;
    const data: MindMapStorage = JSON.parse(stored);
    return !!data[noteId];
  } catch {
    return false;
  }
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
  onDelete: (lessonId: string) => Promise<void>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}> = ({
  lessons,
  activeId,
  setActiveId,
  onAdd,
  notes,
  onJumpToHeading,
  onDelete,
  isCollapsed,
  onToggleCollapse,
}) => {
    const [query, setQuery] = useState("");
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
      null
    );

    // Close sidebar menu when clicking outside
    useEffect(() => {
      if (!menuOpenId) return;

      const handleClickOutside = () => {
        setMenuOpenId(null);
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [menuOpenId]);

    const filtered = useMemo(() => {
      const q = query.toLowerCase();
      return q
        ? lessons.filter((l) => l.title.toLowerCase().includes(q))
        : lessons;
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

    const downloadMarkdownFile = (content: string, filename: string) => {
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
    };

    if (isCollapsed) {
      return (
        <div className="h-full w-16 border-r bg-gradient-to-b from-indigo-50 to-white backdrop-blur-sm flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-center p-3">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600"
              title="Expand sidebar"
            >
              <MenuOpenIcon />
            </button>
          </div>

          {/* Content - Collapsed lesson list */}
          <div className="flex-1 !overflow-y-auto w-full flex flex-col items-center gap-1 py-2 px-2">
            {filtered.map((l) => (
              <button
                key={l._id}
                onClick={() => setActiveId(l._id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${activeId === l._id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                title={l.title}
              >
                {l.title.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center justify-center p-3 !mt-auto">
            <button
              onClick={onAdd}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              title="New lesson"
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <aside className="h-full w-full max-w-xs border-r bg-white backdrop-blur-sm flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 p-4 border-b border-indigo-200/50">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <LibraryBooksIcon className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-indigo-900">My Lessons</span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-indigo-100 text-gray-600"
            title="Collapse sidebar"
          >
            <MenuIcon fontSize="small" />
          </button>
        </div>

        {/* Search - part of header section */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-indigo-200/50">
          <div className="flex items-center gap-2 rounded-lg border border-indigo-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
            <SearchIcon className="h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Content - Scrollable lesson list */}
        <div className="flex-1 min-h-0 !overflow-y-auto px-3 py-3">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No lessons found
              </div>
            ) : (
              filtered.map((l) => {
                const isActive = activeId === l._id;
                const isExpanded = expandedLessonId === l._id;

                const markdown = notes[l._id] || "";
                const headingsTree = extractHeadingsTree(markdown);

                return (
                  <div key={l._id}>
                    {/* Row chính */}
                    <div
                      className={`flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-all ${isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "hover:bg-indigo-100 text-gray-700"
                        }`}
                      onClick={() => setActiveId(l._id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedLessonId(isExpanded ? null : l._id);
                          }}
                          className="p-0.5 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {l.title}
                          </div>
                          <div
                            className={`truncate text-xs ${isActive ? "text-indigo-100" : "text-gray-500"
                              }`}
                          >
                            {fmtDate(l.updated_at)}
                          </div>
                        </div>
                        {/* MindMap indicator */}
                        {hasMindMapInStorage(l._id) && (
                          <AccountTreeIcon 
                            fontSize="small"
                            className={`flex-shrink-0 ${isActive ? "text-indigo-200" : "text-teal-500"}`} 
                            titleAccess="Has Mind Map"
                          />
                        )}
                      </div>

                      {/* Nút 3 chấm */}
                      <button
                        onClick={(e) => handleOpenMenu(e, l._id)}
                        className={`p-1 rounded flex-shrink-0 ${isActive ? "hover:bg-indigo-500" : "hover:bg-gray-200"
                          }`}
                      >
                        <MoreVertIcon fontSize="small" />
                      </button>
                    </div>

                    {/* mục lục khi expand */}
                    {isExpanded && headingsTree.length > 0 && (
                      <div className="ml-8 mt-1 mb-2 pl-2 border-l-2 border-indigo-300 space-y-1">
                        <HeadingTree
                          nodes={headingsTree}
                          onJump={(id: string) => {
                            setActiveId(l._id);
                            return onJumpToHeading(id);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer - New Lesson button */}
        <div className="mt-auto flex-shrink-0 p-3 border-t border-indigo-200/50">
          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2.5 font-medium hover:bg-indigo-700 transition-colors"
          >
            <AddIcon fontSize="small" />
            <span>New Lesson</span>
          </button>
        </div>

        {/* Portal menu */}
        {menuOpenId &&
          menuPos &&
          createPortal(
            <div
              className="absolute z-[9999] w-40 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
              style={{ top: menuPos.top, left: menuPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 border-b font-medium text-gray-700 flex items-center gap-2"
                onClick={() => {
                  setMenuOpenId(null);

                  const markdown = notes[menuOpenId] || "";
                  const title =
                    lessons.find((l) => l._id === menuOpenId)?.title || "note";

                  downloadMarkdownFile(markdown, `${title}.md`);
                }}
              >
                Export (.md)
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                onClick={async () => {
                  setMenuOpenId(null);
                  if (window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
                    await onDelete(menuOpenId);
                  }
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
  onSaveContent: (content: string) => Promise<void>;
}> = ({ lesson, onEditTitle, content, onSaveContent }) => {
  const [localTitle, setLocalTitle] = useState(lesson.title);
  const [titleUpdateStatus, setTitleUpdateStatus] = useState<
    "idle" | "updating" | "updated"
  >("idle");
  const [contentUpdateStatus, setContentUpdateStatus] = useState<
    "idle" | "updating" | "updated"
  >("idle");
  const [prevLessonId, setPrevLessonId] = useState(lesson._id);
  const debouncedTitle = useDebounce(localTitle, 1000);

  // Update local title when lesson changes (MUST come first)
  useEffect(() => {
    setLocalTitle(lesson.title);
    setTitleUpdateStatus("idle");
    setContentUpdateStatus("idle");
    setPrevLessonId(lesson._id);
  }, [lesson._id]); // Use lesson._id to detect when lesson changes

  // Call API when debounced title changes
  useEffect(() => {
    if (
      debouncedTitle !== lesson.title &&
      debouncedTitle === localTitle &&
      prevLessonId === lesson._id
    ) {
      setTitleUpdateStatus("updating");
      onEditTitle(debouncedTitle);
      setTimeout(() => {
        setTitleUpdateStatus("updated");
        setTimeout(() => {
          setTitleUpdateStatus("idle");
        }, 2000);
      }, 500);
    }
  }, [
    debouncedTitle,
    lesson.title,
    localTitle,
    prevLessonId,
    lesson._id,
    onEditTitle,
  ]);

  // Get the most recent status to display
  const displayStatus =
    contentUpdateStatus !== "idle" ? contentUpdateStatus : titleUpdateStatus;

  const handleSaveContent = async (markdown: string) => {
    setContentUpdateStatus("updating");
    try {
      await onSaveContent(markdown);
      setTimeout(() => {
        setContentUpdateStatus("updated");
        setTimeout(() => {
          setContentUpdateStatus("idle");
        }, 2000);
      }, 500);
    } catch (err) {
      setContentUpdateStatus("idle");
    }
  };

  const navigate = useNavigate();

  const handleNavigateToLesson = () => {
    const noteId = lesson._id;

    // If either title or content is being saved, prevent navigation.
    if (displayStatus === "updating") {
      // eslint-disable-next-line no-restricted-globals
      window.alert(
        "Nội dung đang được lưu — vui lòng chờ lưu xong trước khi điều hướng."
      );
      return;
    }

    localStorage.setItem(
      "current_lesson",
      JSON.stringify({
        id: lesson.related_object?.related_id,
        week: parseInt(lesson.related_object?.week_no || "0"),
        title: lesson.title,
        type: "lesson",
        status: "in_progress",
      })
    );

    navigate(
      `/lesson?week=${lesson.related_object?.week_no}&day=${lesson.related_object?.day_id}`
    );
  };

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden">
      {/* Header with title and metadata */}
      <div
        className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 
     flex-shrink-0 sticky top-0 z-20 backdrop-blur-md bg-white/80"
      >
        <input
          className="w-full text-2xl font-bold text-gray-900 outline-none bg-transparent placeholder-gray-300 mb-2"
          value={localTitle}
          onChange={(e) => {
            setLocalTitle(e.target.value);
            setTitleUpdateStatus("idle");
          }}
          placeholder="Lesson title"
        />
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{fmtDate(lesson.updated_at)}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">ID: {lesson._id.slice(0, 8)}</span>
          {lesson.related_object?.related_id && (
            <button
              onClick={handleNavigateToLesson}
              title="Về bài học"
              className="ml-2 p-1 rounded hover:bg-indigo-100 text-indigo-600 transition-colors"
            >
              <LaunchIcon fontSize="small" />
            </button>
          )}
          {displayStatus === "updating" && (
            <div className="flex items-center gap-1.5 ml-auto text-amber-600">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-r-amber-600" />
              <span>Updating...</span>
            </div>
          )}
          {displayStatus === "updated" && (
            <div className="flex items-center gap-1.5 ml-auto text-green-600 font-medium">
              <CheckCircleIcon className="!h-4 !w-4" />
              Updated
            </div>
          )}
        </div>
      </div>

      {/* Editor thay thế phần hiển thị markdown thuần */}
      <MarkdownEditor
        key={lesson._id}
        initialValue={content || ""}
        onSave={handleSaveContent}
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
  // lessons sẽ sinh từ API
  const [lessons, setLessons] = useState<LessonEntry[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showClipboardToast, setShowClipboardToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [aiMenuPos, setAiMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // MindMap states
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mindMapExpanded, setMindMapExpanded] = useState(true);
  const mindMapRef = useRef<MindMapRef>(null);

  // Close AI menu when clicking outside
  useEffect(() => {
    if (!aiMenuOpen) return;

    const handleClickOutside = () => {
      setAiMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [aiMenuOpen]);

  // Fetch notes from server on component mount or when modal opens
  useEffect(() => {
    const fetchNotes = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        setError(null);
        const serverNotes = await user_note_service.getNotesByUserId();

        // Convert server notes to lesson format
        const lessonMap: Record<string, string> = {};
        const lessonList: LessonEntry[] = serverNotes.map((note: User_Note) => {
          lessonMap[note._id] = note.content;
          return {
            _id: note._id,
            user_id: note.user_id,
            title: note.title,
            updated_at: note.updated_at,
            content: note.content,
            created_at: note.created_at,
            related_object: note.related_object
              ? {
                related_id: note.related_object.related_id,
                week_no: note.related_object.week_no,
                day_id: note.related_object.day_id,
              }
              : null,
          } as LessonEntry;
        });

        setLessons(lessonList);
        setNotes(lessonMap);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Không thể tải ghi chú. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [isOpen]);

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
      htmlElement.classList.add("lock-action");
    }

    // --- Hàm dọn dẹp (Cleanup Function) ---
    // Hàm này sẽ chạy khi modal đóng
    return () => {
      // Xóa class đi để trả lại scroll cho trang
      htmlElement.classList.remove("lock-action");
    };
  }, [isOpen]); // useEffect sẽ chạy lại mỗi khi isOpen thay đổi

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  // ref to keep track of scheduled requestAnimationFrame for jumping
  const jumpRafRef = useRef<number | null>(null);

  const active = useMemo(
    () => lessons.find((l) => l._id === activeId) || null,
    [lessons, activeId]
  );

  // activeLesson with mindMap status from localStorage
  const activeLesson = useMemo(() => {
    if (!active) return null;
    return {
      ...active,
      mindMap: hasMindMapInStorage(active._id),
    };
  }, [active]);

  // Handle MindMap generation/opening
  const handleOpenMindMap = useCallback(async (forceRegenerate: boolean) => {
    if (!active) return;
    setAiMenuOpen(false);

    const noteContent = notes[active._id] || "";
    if (!noteContent.trim()) {
      setMapError("Nội dung ghi chú trống. Vui lòng thêm nội dung trước khi tạo mindmap.");
      setShowMindMap(true);
      return;
    }

    // Check localStorage cache first
    if (!forceRegenerate) {
      const cachedMap = getMindMapFromStorage(active._id);
      if (cachedMap) {
        setMindMapData(cachedMap);
        setMapError(null);
        setShowMindMap(true);
        return;
      }
    }

    // Generate new mindmap
    setShowMindMap(true);
    setIsGeneratingMap(true);
    setMapError(null);
    setMindMapData(null);

    try {
      const result = await geminiService.generateMindMap(noteContent);
      if (result) {
        setMindMapData(result);
        saveMindMapToStorage(active._id, result);
      } else {
        setMapError("Không thể tạo mindmap. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error generating mindmap:", err);
      setMapError("Có lỗi xảy ra khi tạo mindmap. Vui lòng thử lại.");
    } finally {
      setIsGeneratingMap(false);
    }
  }, [active, notes]);

  const addLesson = async () => {
    try {
      const newNote = await user_note_service.createNote({
        title: "New Lesson",
        content: "# New Lesson",
      });

      // Add the server-returned note (User_Note) directly to state
      setLessons((prev) => [...prev, newNote]);
      setNotes((prev) => ({ ...prev, [newNote._id]: newNote.content }));
      setActiveId(newNote._id);
    } catch (err) {
      console.error("Error creating note:", err);
      setError("Không thể tạo ghi chú mới.");
    }
  };

  const editTitle = async (title: string) => {
    if (!active) return;

    try {
      // Update on server
      const updated = await user_note_service.updateNote({ title }, active._id);

      // Update local state
      setLessons((prev) =>
        prev.map((l) =>
          l._id === active._id
            ? { ...l, title, updated_at: updated.updated_at }
            : l
        )
      );
      setError("");
    } catch (err) {
      console.error("Error updating title:", err);
      setError("Không thể cập nhật tiêu đề.");
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      await user_note_service.deleteNote(lessonId);

      // Remove from local state
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      const newNotes = { ...notes };
      delete newNotes[lessonId];
      setNotes(newNotes);

      // Clear active if deleted lesson was active
      if (activeId === lessonId) {
        setActiveId(null);
      }
      setError("");
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Không thể xóa ghi chú.");
    }
  };

  const saveContent = async (content: string) => {
    if (!active) return;

    try {
      const saved = await user_note_service.updateNote({ content }, active._id);

      // Update local cache
      setNotes((prev) => ({
        ...prev,
        [active._id]: content,
      }));
      setLessons((prev) =>
        prev.map((l) =>
          l._id === active._id ? { ...l, updated_at: saved.updated_at } : l
        )
      );
      setError("");
      // Dispatch an event so other components in the same tab can react
      try {
        window.dispatchEvent(
          new CustomEvent("note:updated", {
            detail: { id: active._id, content },
          })
        );
      } catch (e) {
        console.error("Failed to dispatch note:updated", e);
      }
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Không thể lưu nội dung.");
    }
  };

  const handleJumpToHeading = (id: string) => {
    // Cancel any previously scheduled jump
    if (jumpRafRef.current) {
      cancelAnimationFrame(jumpRafRef.current);
      jumpRafRef.current = null;
    }

    // Schedule the scroll on the next animation frame(s) so that
    // React has time to commit the DOM after setActiveId.
    jumpRafRef.current = requestAnimationFrame(() => {
      // One extra frame can help when the editor is remounted
      jumpRafRef.current = requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback: try to find headings inside the editor container
          const container = document.querySelector(".markdown-editor");
          if (container) {
            const headings = container.querySelectorAll("h1,h2,h3,h4,h5,h6");
            for (const h of Array.from(headings)) {
              if (
                (h.textContent || "")
                  .trim()
                  .toLowerCase()
                  .includes(id.replace(/^heading-/, "").replace(/-/g, " "))
              ) {
                (h as HTMLElement).scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                break;
              }
            }
          }
        }
        jumpRafRef.current = null;
      });
    });
  };

  // Cleanup any pending RAF when component unmounts
  useEffect(() => {
    return () => {
      if (jumpRafRef.current) {
        cancelAnimationFrame(jumpRafRef.current);
        jumpRafRef.current = null;
      }
    };
  }, []);

  const handlePasteClipboard = async () => {
    if (!clipboardText || !active) return;

    try {
      const timestamp = new Date().toLocaleString();
      const formattedContent = `\n\n---\n\n> **Highlighted on ${timestamp}**\n> \n> ${clipboardText
        .split("\n")
        .join("\n> ")}\n\n`;

      const currentContent = notes[active._id] || "";
      const newContent = currentContent + formattedContent;

      // Update on server
      await user_note_service.updateNote({ content: newContent }, active._id);

      // Update local state
      setNotes({
        ...notes,
        [active._id]: newContent,
      });

      setShowClipboardToast(false);
    } catch (err) {
      console.error("Error pasting clipboard:", err);
      setError("Không thể dán nội dung.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-[2001] bg-white shadow-2xl flex flex-col"
        style={{
          transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          width: isMaximized ? "100vw" : "90%",
          height: isMaximized ? "100vh" : "85%",
          maxWidth: isMaximized ? "none" : "1280px",
          maxHeight: isMaximized ? "none" : "750px",
          borderRadius: isMaximized ? "0px" : "24px",
          overflow: isMaximized ? "auto" : "hidden",
          willChange: "width, height, border-radius",
        }}
      >
        {error && (
          <div className="bg-red-100 border-b border-red-300 text-red-700 px-4 py-3 rounded-t-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-600 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}
        <header className="flex items-center justify-between p-3 border-b bg-gradient-to-b from-indigo-50 to-white backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold font-serif text-xs">N</div>
            <h1 className="text-lg font-semibold text-slate-700 tracking-tight">Study Notebook</h1>
          </div>
          <div className="flex gap-2 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setAiMenuOpen(!aiMenuOpen);
                setAiMenuPos({ top: rect.bottom + 4, left: rect.left });
              }}
              disabled={!active}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all font-medium text-sm disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              <AutoAwesomeIcon fontSize="small" />
              AI Tools
            </button>

            {/* AI Tools Dropdown Menu - Portal to body */}
            {aiMenuOpen && aiMenuPos && createPortal(
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed w-64 bg-white rounded-xl shadow-xl border border-indigo-100 z-[9999] overflow-hidden py-1"
                  style={{ top: aiMenuPos.top, left: aiMenuPos.left - 200 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Mind Map</div>
                  {activeLesson?.mindMap ? (
                    <>
                      <button onClick={() => handleOpenMindMap(false)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 text-slate-700 flex items-center gap-2">
                        <AccountTreeIcon fontSize="small" className="text-teal-500" /> Open Existing Map
                      </button>
                      <button onClick={() => handleOpenMindMap(true)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 text-slate-700 flex items-center gap-2">
                        <RefreshIcon fontSize="small" className="text-orange-500" /> Regenerate Map
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleOpenMindMap(true)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 text-slate-700 flex items-center gap-2">
                      <AutoAwesomeOutlinedIcon fontSize="small" className="text-indigo-500" /> Generate New Map
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100"></div>
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Other</div>

                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 text-slate-700 flex items-center gap-2">
                    <DescriptionIcon fontSize="small" className="text-blue-500" /> Summary
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 text-slate-700 flex items-center gap-2">
                    <QuizIcon fontSize="small" className="text-orange-500" /> Quiz
                  </button>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}

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

        <div
          className={`grid h-full overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "grid-cols-[64px_1fr]" : "grid-cols-[280px_1fr]"
            }`}
        >
          <Sidebar
            lessons={lessons}
            activeId={activeId}
            setActiveId={setActiveId}
            onAdd={addLesson}
            notes={notes}
            onJumpToHeading={handleJumpToHeading}
            onDelete={deleteLesson}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="overflow-y-auto relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Đang tải ghi chú...</div>
              </div>
            ) : !active ? (
              <div className="mx-auto max-w-3xl rounded-3xl border bg-white/70 p-8 text-center text-gray-600">
                Chọn hoặc tạo một mục để bắt đầu viết.
              </div>
            ) : (
              <NotebookPage
                lesson={active}
                onEditTitle={editTitle}
                content={notes[active._id] || ""}
                onSaveContent={saveContent}
              />
            )}

            {/* Clipboard Toast - Floating notification */}
            {showClipboardToast && clipboardText && (
              <div className="fixed bottom-6 right-6 z-[2010] max-w-md animate-slide-up">
                <div className="rounded-2xl bg-white shadow-2xl border-2 border-indigo-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-semibold text-sm">
                        Nội dung đã sao chép
                      </span>
                    </div>
                    <button
                      onClick={() => setShowClipboardToast(false)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
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
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {active ? "Paste vào mục này" : "Chọn mục trước"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* MindMap Modal Overlay */}
        <AnimatePresence>
          {showMindMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMindMap(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-[95vw] h-full max-w-[1600px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/80 bg-white rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
                      <AccountTreeIcon className="text-white" fontSize="small" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 leading-tight">Mind Map</h2>
                      {active && (
                        <span className="text-xs text-slate-400 font-medium">{active.title}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isGeneratingMap && mindMapData && (
                      <button
                        onClick={() => handleOpenMindMap(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all text-sm font-medium shadow-md shadow-orange-200 active:scale-95"
                      >
                        <RefreshIcon fontSize="small" />
                        Regenerate
                      </button>
                    )}
                    <button
                      onClick={() => setShowMindMap(false)}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="h-[calc(100%-57px)] w-full rounded-b-2xl">
                  {isGeneratingMap ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-lg font-medium text-slate-600">Đang tạo Mind Map...</p>
                      <p className="text-sm text-slate-400">Quá trình này có thể mất vài giây</p>
                    </div>
                  ) : mapError ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-red-600">{mapError}</p>
                      <button
                        onClick={() => handleOpenMindMap(true)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : mindMapData ? (
                    <MindMapVisualization 
                      ref={mindMapRef} 
                      data={mindMapData} 
                      showControls={false}
                    />
                  ) : null}
                </div>

                {/* Controls - Outside overflow-hidden container */}
                {!isGeneratingMap && !mapError && mindMapData && (
                  <>
                    {/* Bottom Left: Zoom & Expand Controls */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                      <div className="flex items-center bg-white shadow-lg rounded-xl border border-slate-200 p-1 gap-0.5">
                        <button 
                          onClick={() => mindMapRef.current?.zoomOut()}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95"
                          title="Zoom Out"
                        >
                          <ZoomOutIcon fontSize="small" />
                        </button>
                        <div className="w-px h-5 bg-slate-200"></div>
                        <button 
                          onClick={() => mindMapRef.current?.resetView()}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95"
                          title="Reset View"
                        >
                          <RefreshIcon fontSize="small" />
                        </button>
                        <div className="w-px h-5 bg-slate-200"></div>
                        <button 
                          onClick={() => mindMapRef.current?.zoomIn()}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95"
                          title="Zoom In"
                        >
                          <ZoomInIcon fontSize="small" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          mindMapRef.current?.toggleExpandAll();
                          setMindMapExpanded(!mindMapExpanded);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border transition-all duration-200 text-sm font-medium active:scale-95 ${
                          mindMapExpanded 
                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300' 
                            : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {mindMapExpanded ? (
                          <>
                            <UnfoldLessIcon fontSize="small" />
                            <span>Collapse</span>
                          </>
                        ) : (
                          <>
                            <UnfoldMoreIcon fontSize="small" />
                            <span>Expand All</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bottom Right: Hint */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/90 rounded-lg text-xs text-slate-400 border border-slate-200/60 shadow-sm">
                        <span>🖱️ Drag to pan</span>
                        <span className="text-slate-300">•</span>
                        <span>🔍 Scroll to zoom</span>
                        <span className="text-slate-300">•</span>
                        <span>👆 Click node to expand/collapse</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
