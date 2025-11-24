import { useState } from "react";
import PracticeLayout from "../layouts/PracticeLayout";
import { Box } from "@mui/material";
import DefinitionModeSelector, {
  DefinitionMode,
} from "../../components/practices/DefinitionModeSelector";
import DefinitionTopicList from "../../components/practices/DefinitionTopicList";
import { useNavigate } from "react-router-dom";

const PracticeDefinitionBasedPage = () => {
  const [selectedMode, setSelectedMode] = useState<DefinitionMode | null>(null);
  const navigate = useNavigate();

  const handleSelectMode = (mode: DefinitionMode) => {
    setSelectedMode(mode);
  };

  const handleSelectTopic = (topicId: string) => {
    if (!selectedMode) return;
    // Navigate to detail page with mode and topicId
    navigate(`/practice-skill/definition_based/${selectedMode}/${topicId}`);
  };

  const handleBackToModeSelection = () => {
    setSelectedMode(null);
  };

  return (
    <PracticeLayout>
      <Box flex={1} className="overflow-y-auto">
        {!selectedMode ? (
          <DefinitionModeSelector onSelectMode={handleSelectMode} />
        ) : (
          <Box>
            <Box sx={{ px: 4, pt: 3 }}>
              <Box
                component="button"
                onClick={handleBackToModeSelection}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#2563eb",
                    color: "#2563eb",
                    background: "#eff6ff",
                  },
                }}
              >
                ← Quay lại chọn chế độ
              </Box>
            </Box>
            <DefinitionTopicList
              mode={selectedMode}
              onSelectTopic={handleSelectTopic}
            />
          </Box>
        )}
      </Box>
    </PracticeLayout>
  );
};

export default PracticeDefinitionBasedPage;
