import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import { practiceDefinitionService } from "../../services/practice_definition.service";
import { PracticeTopicVocabulary } from "../../types/PracticeDefinition";

interface DefinitionTopicListProps {
  mode: "definition" | "guess";
  onSelectTopic: (topicId: string) => void;
}

const DefinitionTopicList = ({
  mode,
  onSelectTopic,
}: DefinitionTopicListProps) => {
  const [topics, setTopics] = useState<PracticeTopicVocabulary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [mode]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await practiceDefinitionService.getTopics({
        page: 1,
        limit: 100,
        isPublic: true,
      });
      setTopics(response.items);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 4, py: 4 }}>
      <Stack spacing={2} mb={4}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            background: "linear-gradient(90deg, #2563eb, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {mode === "definition"
            ? "Chọn chủ đề - Tự định nghĩa"
            : "Chọn chủ đề - Đoán từ"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {mode === "definition"
            ? "Chọn một chủ đề để luyện tập viết định nghĩa từ vựng"
            : "Chọn một chủ đề để luyện tập đoán từ vựng"}
        </Typography>
      </Stack>

      {topics.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography color="text.secondary">
            Chưa có chủ đề nào. Vui lòng thử lại sau.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {topics.map((topic) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic._id}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => onSelectTopic(topic._id)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    border: "1px solid rgba(37,99,235,0.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease",
                    height: "100%",
                    "&:hover": {
                      borderColor: "#2563eb",
                      boxShadow: "0 8px 20px rgba(37,99,235,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                        }}
                      >
                        <SchoolIcon sx={{ color: "#fff", fontSize: 24 }} />
                      </Box>
                      {topic.level && (
                        <Chip
                          label={topic.level}
                          size="small"
                          sx={{
                            backgroundColor: "#eff6ff",
                            color: "#2563eb",
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ color: "#1e293b", mb: 1 }}
                    >
                      {topic.title}
                    </Typography>

                    {topic.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.5,
                        }}
                      >
                        {topic.description}
                      </Typography>
                    )}

                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      <Typography variant="caption" color="text.secondary">
                        {topic.vocabulary_count || 0} từ vựng
                      </Typography>
                      {topic.tags && topic.tags.length > 0 && (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          {topic.tags.slice(0, 2).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          ))}
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DefinitionTopicList;
