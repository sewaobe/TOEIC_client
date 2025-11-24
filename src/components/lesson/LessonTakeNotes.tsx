import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { CircularProgress } from '@mui/material';
import { useDebounce } from "../../hooks/useDebounce";
import { MarkdownEditor } from "../common/MarkdownEditor";
import { User_Note } from "../../types/User_Note";
import { user_note_service } from "../../services/user_note.service";

interface LessonTakeNotesProps {
  lesson: any;
  week: string;
  day_id: string;
}

export default function LessonTakeNotes({
  lesson,
  week,
  day_id
}: LessonTakeNotesProps) {
  const [note, setNote] = useState<User_Note | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "updating" | "updated" | "error">("idle");
  const [editorKey, setEditorKey] = useState(0);

  const fetchNote = async () => {
    const note = await user_note_service.getNoteByRelatedId(lesson?._id);

    if (!note) {
      const newNote = await user_note_service.createNote({
        title: lesson?.title,
        content: "# New note content ",
        related_object: {
          related_id: lesson?._id,
          week_no: week,
          day_id
        }
      });
      setNote(newNote);
    }
    else {
      setNote(note);
    }
  }

  useEffect(() => {
    try {
      setIsLoading(true);
      fetchNote();
    } catch (err) {
      console.error("Failed to fetch or create note:", err);
    } finally {
      setIsLoading(false);
    }
  }, [])

  // Listen for cross-component updates (NotebookPage dispatches 'note:updated')
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const { id, content } = ev.detail || {};
        if (!id) {
          return;
        }
        // if we haven't loaded the note yet, ignore
        if (!note) {
          return;
        }
        if (id !== note._id) {
          return;
        }

        setNote((prev) => (prev ? { ...prev, content } as User_Note : prev));
        setEditorKey((k) => k + 1);
      } catch (err) {
        console.error('note:updated handler error', err);
      }
    };

    window.addEventListener('note:updated', handler as EventListener);
    return () => window.removeEventListener('note:updated', handler as EventListener);
  }, [note]);
  const handleUpdateNote = async (newContent: string) => {
    if (!note) return;

    try {
      setStatus("updating");
      const updatedNote = await user_note_service.updateNote(
        { content: newContent },
        note._id
      );
      setNote(updatedNote);
      setStatus("updated");
    } catch (err) {
      setStatus("error");
      console.error("Failed to update note:", err);
    }
  };

  // Debounce the 'updated' status back to 'idle' so UI shows a short "Saved" state
  const debouncedUpdated = useDebounce(status === 'updated', 1500);
  useEffect(() => {
    if (debouncedUpdated) {
      setStatus('idle');
    }
  }, [debouncedUpdated]);

  return (
    <div className="max-w-5xl mx-auto space-y-4 w-full">
      <Box
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          position: 'relative'
        }}
      >
        {/* Status indicator */}
        <Box sx={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 1, zIndex: 10 }}>
          {isLoading && (
            <>
              <CircularProgress size={18} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>Loading...</Typography>
            </>
          )}

          {!isLoading && status === 'updating' && (
            <>
              <CircularProgress size={18} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>Updating...</Typography>
            </>
          )}

          {!isLoading && status === 'updated' && (
            <>
              <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ ml: 0.5, color: 'success.main' }}>Saved</Typography>
            </>
          )}

          {!isLoading && status === 'error' && (
            <>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ ml: 0.5, color: 'error.main' }}>Error</Typography>
            </>
          )}
        </Box>
        <MarkdownEditor
          key={`${note?._id}-${editorKey}`}
          initialValue={note?.content || ""}
          onSave={handleUpdateNote}
        />
      </Box>
    </div>
  );
}
