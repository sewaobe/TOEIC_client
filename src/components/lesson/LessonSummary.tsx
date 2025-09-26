import { useState } from "react";
import { Typography, Box } from "@mui/material";
import { MarkdownEditor } from "../common/MarkdownEditor";

const initialNote = {
  id: 1,
  title: "Note cho bài học",
  content: `# Ghi chú ban đầu
Bạn có thể chỉnh sửa nội dung này bằng Markdown.
- Ghi chú quan trọng 1
- Ghi chú quan trọng 2
`,
};

export default function LessonNotes() {
  const [note, setNote] = useState(initialNote);

  const handleUpdateNote = (newContent: string) => {
    setNote({ ...note, content: newContent });
    // TODO: lưu vào localStorage hoặc API backend
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Box
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
        }}
      >
        <MarkdownEditor
          key={note.id}
          initialValue={note.content}
          onSave={handleUpdateNote}
        />
      </Box>
    </div>
  );
}
