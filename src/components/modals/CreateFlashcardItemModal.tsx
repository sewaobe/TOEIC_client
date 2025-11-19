import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Collapse,
  IconButton,
  Stack,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import BaseModal from "./BaseModal";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface CreateFlashcardItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FlashcardItem) => Promise<void> | void;
  listName: string;
  editData?: FlashcardItem | null;
}

export interface FlashcardItem {
  _id?: string;
  word: string;
  definition?: string;
  definition_en?: string;
  definition_vi?: string;
  image?: string | null; // chỉ lưu string (base64 hoặc URL)
  type?: string;
  phonetic?: string;
  examples?: { en: string; vi: string }[];
  notes?: string;
  weight?: number;
}

const CreateFlashcardItemModal: React.FC<CreateFlashcardItemModalProps> = ({
  open,
  onClose,
  onSave,
  listName,
  editData,
}) => {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [examples, setExamples] = useState<{ en: string; vi: string }[]>([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setWord(editData.word || "");
      setDefinition(editData.definition || "");
      setImage(editData.image || null);
      setType(editData.type || "");
      setPhonetic(editData.phonetic || "");
      setExamples(editData.examples || []);
      setNotes(editData.notes || "");
    } else {
      setWord("");
      setDefinition("");
      setImage(null);
      setType("");
      setPhonetic("");
      setExamples([]);
      setNotes("");
    }
  }, [editData, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => setImage(null);
  const handleAddExample = () => setExamples([...examples, { en: "", vi: "" }]);
  const handleChangeExample = (
    index: number,
    field: "en" | "vi",
    value: string
  ) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
  };
  const handleDeleteExample = (index: number) =>
    setExamples(examples.filter((_, i) => i !== index));

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        word,
        definition,
        image,
        type,
        phonetic,
        examples,
        notes,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      type="info"
      title={editData ? "Chỉnh sửa flashcard" : "Tạo flashcard mới"}
      onCancel={onClose}
      onConfirm={handleSave}
      confirmText={isLoading ? "Đang lưu..." : "Lưu"}
    >
      {/* ✅ Overlay mờ + spinner */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 64, // tránh đè header modal
            left: 0,
            width: "100%",
            height: "calc(100% - 64px)",
            bgcolor: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}

      <Box sx={{ position: "relative" }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          List từ: {listName}
        </Typography>

        <TextField
          fullWidth
          label="Từ mới"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Định nghĩa"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />

        <Button
          variant="text"
          onClick={() => setShowExtra(!showExtra)}
          sx={{ mb: 1, textTransform: "none" }}
          disabled={isLoading}
        >
          Thêm phiên âm, ví dụ, ảnh, ghi chú {showExtra ? "▲" : "▼"}
        </Button>

        <Collapse in={showExtra}>
          <Box sx={{ mt: 1 }}>
            <Divider sx={{ mb: 2 }} />

            {/* Ảnh minh họa */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Ảnh minh họa
              </Typography>

              {!image ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              ) : (
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src={image}
                    alt="preview"
                    style={{
                      width: "200px",
                      height: "auto",
                      display: "block",
                      borderRadius: "8px",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  />
                  {!isLoading && (
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                      }}
                    >
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label="Loại từ (N, V, ADJ...)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{ mb: 2 }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Phiên âm"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Ví dụ ({examples.length}/10)
            </Typography>

            {examples.map((ex, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  bgcolor: "#fafafa",
                  position: "relative",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    label={`Câu ví dụ ${index + 1} (EN)`}
                    value={ex.en}
                    onChange={(e) =>
                      handleChangeExample(index, "en", e.target.value)
                    }
                    disabled={isLoading}
                  />
                  <TextField
                    fullWidth
                    label={`Nghĩa tiếng Việt`}
                    value={ex.vi}
                    onChange={(e) =>
                      handleChangeExample(index, "vi", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </Stack>
                {!isLoading && (
                  <IconButton
                    onClick={() => handleDeleteExample(index)}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(255,255,255,0.8)",
                      "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                    }}
                  >
                    <DeleteIcon color="error" fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}

            {examples.length < 10 && (
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddExample}
                sx={{ mb: 3 }}
                disabled={isLoading}
              >
                Thêm ví dụ
              </Button>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Ghi chú"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
            />
          </Box>
        </Collapse>
        {isLoading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </Box>
    </BaseModal>
  );
};

export default CreateFlashcardItemModal;
