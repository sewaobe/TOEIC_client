import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Collapse,
  Button,
  Stack,
  LinearProgress,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { topicService } from "../../services/topic.service";
import { vocabularyService } from "../../services/vocabulary.service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../stores/store";
import { showSnackbar } from "../../stores/snackbarSlice";
import BaseModal from "./BaseModal";
import { TOEIC_TAGS } from "../../constants/toeicTags";

interface CreateVocabularyModalProps {
  open: boolean;
  onClose: () => void;
  initialWord?: string;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
}

interface VocabularyFormData {
  word: string;
  phonetic: string;
  definition: string;
  type: string;
  examples: { en: string; vi: string }[];
  notes: string;
  image?: string | null;
}

const CreateVocabularyModal: React.FC<CreateVocabularyModalProps> = ({
  open,
  onClose,
  initialWord = "",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = useState(0); // 0: Select existing, 1: Create new
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  // New Topic Form
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newTopicTags, setNewTopicTags] = useState<string[]>([]);

  // Vocabulary Form
  const [vocabularyData, setVocabularyData] = useState<VocabularyFormData>({
    word: initialWord,
    phonetic: "",
    definition: "",
    type: "",
    examples: [],
    notes: "",
    image: null,
  });

  // Load topics when modal opens
  useEffect(() => {
    if (open) {
      loadTopics();
      setVocabularyData((prev) => ({ ...prev, word: initialWord }));
    }
  }, [open, initialWord]);

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await topicService.getAllTopicVocabulary(1, 100);
      setTopics(response.items);
    } catch (error) {
      console.error("Error loading topics:", error);
      dispatch(
        showSnackbar({
          message: "Không thể tải danh sách chủ đề",
          severity: "error",
        })
      );
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVocabularyChange = (field: keyof VocabularyFormData, value: any) => {
    setVocabularyData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setVocabularyData((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => setVocabularyData((prev) => ({ ...prev, image: null }));

  const handleAddExample = () => {
    if (vocabularyData.examples.length < 10) {
      setVocabularyData((prev) => ({
        ...prev,
        examples: [...prev.examples, { en: "", vi: "" }],
      }));
    }
  };

  const handleChangeExample = (index: number, field: "en" | "vi", value: string) => {
    const updated = [...vocabularyData.examples];
    updated[index][field] = value;
    setVocabularyData((prev) => ({ ...prev, examples: updated }));
  };

  const handleDeleteExample = (index: number) => {
    setVocabularyData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!vocabularyData.word.trim()) {
      dispatch(
        showSnackbar({
          message: "Vui lòng nhập từ vựng",
          severity: "warning",
        })
      );
      return false;
    }

    if (tabValue === 0 && !selectedTopicId) {
      dispatch(
        showSnackbar({
          message: "Vui lòng chọn chủ đề",
          severity: "warning",
        })
      );
      return false;
    }

    if (tabValue === 1 && !newTopicTitle.trim()) {
      dispatch(
        showSnackbar({
          message: "Vui lòng nhập tên chủ đề",
          severity: "warning",
        })
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let topicId = selectedTopicId;

      // If creating new topic
      if (tabValue === 1) {
        const newTopicData = {
          title: newTopicTitle,
          description: newTopicDescription,
          tags: newTopicTags,
          isPublic: false,
        };
        const createdTopic = await topicService.createTopicVocabulary(newTopicData);
        topicId = createdTopic._id;
        
        dispatch(
          showSnackbar({
            message: "Tạo chủ đề thành công!",
            severity: "success",
          })
        );
      }

      // Create vocabulary
      const vocabularyPayload = {
        ...vocabularyData,
        topicId: topicId,
      };

      await vocabularyService.createVocabulary(vocabularyPayload);

      dispatch(
        showSnackbar({
          message: "Tạo từ vựng thành công!",
          severity: "success",
        })
      );

      handleClose();
    } catch (error: any) {
      console.error("Error creating vocabulary:", error);
      dispatch(
        showSnackbar({
          message: error?.response?.data?.message || "Có lỗi xảy ra khi tạo từ vựng",
          severity: "error",
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTabValue(0);
    setSelectedTopicId("");
    setNewTopicTitle("");
    setNewTopicDescription("");
    setNewTopicTags([]);
    setShowExtra(false);
    setVocabularyData({
      word: "",
      phonetic: "",
      definition: "",
      type: "",
      examples: [],
      notes: "",
      image: null,
    });
    onClose();
  };

  return (
    <BaseModal
      open={open}
      type="info"
      title="Tạo Từ Vựng Mới"
      onCancel={handleClose}
      onConfirm={handleSubmit}
      confirmText={submitting ? "Đang lưu..." : "Lưu"}
      cancelText="Hủy"
      PaperProps={{
        sx: {
          width: { xs: "90%", sm: 600 },
          maxWidth: "95%",
          borderRadius: 2,
        },
      }}
    >
      {/* ✅ Overlay mờ + spinner khi đang submit */}
      {submitting && (
        <Box
          sx={{
            position: "absolute",
            top: 64,
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
        {/* Topic Selection */}
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight="600" mb={1}>
            Chọn hoặc Tạo Chủ Đề
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Chọn Chủ Đề Có Sẵn" disabled={submitting} />
            <Tab label="Tạo Chủ Đề Mới" disabled={submitting} />
          </Tabs>

          {/* Tab 0: Select Existing Topic */}
          {tabValue === 0 && (
            <FormControl fullWidth>
              <InputLabel>Chọn Chủ Đề</InputLabel>
              <Select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                label="Chọn Chủ Đề"
                disabled={loadingTopics || submitting}
              >
                {loadingTopics ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Đang tải...
                  </MenuItem>
                ) : topics.length === 0 ? (
                  <MenuItem disabled>Chưa có chủ đề nào</MenuItem>
                ) : (
                  topics.map((topic) => (
                    <MenuItem key={topic._id} value={topic._id}>
                      {topic.title}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}

          {/* Tab 1: Create New Topic */}
          {tabValue === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Tên Chủ Đề"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                sx={{ mb: 2 }}
                required
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Mô Tả"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={2}
                disabled={submitting}
              />
              <Autocomplete
                multiple
                freeSolo
                options={TOEIC_TAGS}
                value={newTopicTags}
                onChange={(_, newValue) => setNewTopicTags(newValue as string[])}
                disabled={submitting}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Thẻ (tags)"
                    placeholder="Chọn hoặc nhập tags"
                  />
                )}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Vocabulary Form */}
        <Typography variant="subtitle1" fontWeight="600" mb={1}>
          Thông Tin Từ Vựng
        </Typography>

        <TextField
          fullWidth
          label="Từ mới"
          value={vocabularyData.word}
          onChange={(e) => handleVocabularyChange("word", e.target.value)}
          sx={{ mb: 2 }}
          required
          disabled={submitting}
        />

        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Định nghĩa"
          value={vocabularyData.definition}
          onChange={(e) => handleVocabularyChange("definition", e.target.value)}
          sx={{ mb: 2 }}
          disabled={submitting}
        />

        <Button
          variant="text"
          onClick={() => setShowExtra(!showExtra)}
          sx={{ mb: 1, textTransform: "none" }}
          disabled={submitting}
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

              {!vocabularyData.image ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={submitting}
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
                    src={vocabularyData.image}
                    alt="preview"
                    style={{
                      width: "200px",
                      height: "auto",
                      display: "block",
                      borderRadius: "8px",
                      opacity: submitting ? 0.6 : 1,
                    }}
                  />
                  {!submitting && (
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
              value={vocabularyData.type}
              onChange={(e) => handleVocabularyChange("type", e.target.value)}
              sx={{ mb: 2 }}
              disabled={submitting}
            />

            <TextField
              fullWidth
              label="Phiên âm"
              value={vocabularyData.phonetic}
              onChange={(e) => handleVocabularyChange("phonetic", e.target.value)}
              sx={{ mb: 3 }}
              placeholder="/prəˌnʌnsiˈeɪʃn/"
              disabled={submitting}
            />

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Ví dụ ({vocabularyData.examples.length}/10)
            </Typography>

            {vocabularyData.examples.map((ex, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  bgcolor: "#fafafa",
                  position: "relative",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    label={`Câu ví dụ ${index + 1} (EN)`}
                    value={ex.en}
                    onChange={(e) => handleChangeExample(index, "en", e.target.value)}
                    disabled={submitting}
                  />
                  <TextField
                    fullWidth
                    label="Nghĩa tiếng Việt"
                    value={ex.vi}
                    onChange={(e) => handleChangeExample(index, "vi", e.target.value)}
                    disabled={submitting}
                  />
                </Stack>
                {!submitting && (
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

            {vocabularyData.examples.length < 10 && (
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddExample}
                sx={{ mb: 3 }}
                disabled={submitting}
              >
                Thêm ví dụ
              </Button>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Ghi chú"
              value={vocabularyData.notes}
              onChange={(e) => handleVocabularyChange("notes", e.target.value)}
              disabled={submitting}
            />
          </Box>
        </Collapse>

        {submitting && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </Box>
    </BaseModal>
  );
};

export default CreateVocabularyModal;
