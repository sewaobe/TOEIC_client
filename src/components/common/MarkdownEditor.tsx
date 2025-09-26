import { FC, useState, useEffect } from "react";
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor, useInstance } from "@milkdown/react";
import { getMarkdown, replaceAll } from "@milkdown/utils";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import useLocalStorage from "../../hooks/useLocalStorage";
import { toast } from "sonner";

interface MarkdownEditorProps {
  initialValue?: string;
  onSave?: (markdown: string, target: string) => void;
}

const STORAGE_KEY = "markdown_notes";

const MarkdownEditorImpl: FC<MarkdownEditorProps> = ({ initialValue, onSave }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>("lesson1");

  // ✅ dùng hook để lưu notes theo target
  const [notes, setNotes] = useLocalStorage<Record<string, string>>(STORAGE_KEY, {});

  // ✅ nội dung hiện tại
  const savedContent = notes[selectedTarget] || initialValue || "# Gõ thử đi 🚀";

  useEditor(
    (root) =>
      new Crepe({
        root,
        defaultValue: savedContent,
      }),
    [selectedTarget] // reload khi đổi target
  );

  const [loading, getEditor] = useInstance();

  // Nếu có dữ liệu trong localStorage thì thay thế nội dung khi đổi target
  useEffect(() => {
    if (loading) return;
    const editor = getEditor();
    if (!editor) return;

    const markdown = notes[selectedTarget];
    if (markdown) {
      editor.action(replaceAll(markdown));
    }
  }, [selectedTarget, notes, getEditor, loading]);

  const handleSaveClick = () => {
    setModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (loading) return;
    const editor = getEditor();
    if (!editor) return;

    const markdown = editor.action(getMarkdown());

    console.log("Markdown content:", markdown);
    console.log("Lưu vào mục:", selectedTarget);

    // ✅ lưu vào localStorage
    setNotes({
      ...notes,
      [selectedTarget]: markdown,
    });

    onSave?.(markdown, selectedTarget);
    setModalOpen(false);
    toast.success("Lưu notebook thành công");
  };

  return (
    <div className="flex flex-col h-full max-h-[400px] overflow-y-auto">
      <div className="flex-1 overflow-auto markdown-editor">
        <Milkdown />
      </div>
      <div className="flex justify-end mt-3">
        <button
          onClick={handleSaveClick}
          className="px-3 py-1.5 bg-blue-600 text-white rounded cursor-pointer"
        >
          💾 Lưu
        </button>
      </div>

      {/* Modal chọn nơi lưu */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Chọn nơi lưu</h2>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full border rounded px-2 py-1 mb-4"
            >
              <option value="lesson1">📘 Bài học 1</option>
              <option value="lesson2">📘 Bài học 2</option>
              <option value="lesson3">📘 Bài học 3</option>
              <option value="other">📂 Thư mục khác</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
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
