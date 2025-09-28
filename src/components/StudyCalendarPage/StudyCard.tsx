import { Box, Typography, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import {
  useStudyCardViewModel,
  StudyStatus,
} from "../../viewmodels/StudyCalendarPage/useStudyCardViewModel";

interface Props {
  title: string;
  progress?: string;
  status: StudyStatus;
  sessions: { name: string }[];
  tag?: string;
  note?: string;
  dateLabel?: string;
  sx?: any;
}

const StudyCard: React.FC<Props> = ({
  title,
  progress,
  status,
  sessions,
  tag,
  note,
  dateLabel,
  sx,
}) => {
  const { color } = useStudyCardViewModel(status);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: color.bg,
        boxShadow: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        ...sx,
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Chip
          icon={
            status === "DONE" ? (
              <CheckCircleIcon sx={{ color: "white !important" }} />
            ) : status === "IN_PROGRESS" ? (
              <ErrorIcon sx={{ color: "white !important" }} />
            ) : undefined
          }
          label={title}
          size="small"
          sx={{
            bgcolor: color.headerBg,
            color: "white",
            fontWeight: "bold",
          }}
        />

        {progress && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <EmojiEventsIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
            <Typography fontWeight="bold" color={color.text}>
              {progress}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Date */}
      {dateLabel && (
        <Typography
          variant="body2"
          fontWeight="bold"
          color={color.text}
          mb={0.5}
        >
          {dateLabel}
        </Typography>
      )}

      {/* Sessions */}
      <Box flexGrow={1}>
        {sessions.map((s, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: color.text,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: status === "LOCK" ? "#9CA3AF" : "#10B981",
                flexShrink: 0,
              }}
            />
            {s.name}
          </Typography>
        ))}
      </Box>

      {/* Tag */}
      {tag && (
        <Chip
          label={tag}
          size="small"
          sx={{
            bgcolor: "white",
            color: color.text,
            fontWeight: "bold",
            mt: 1,
          }}
        />
      )}

      {/* Note */}
      {note && (
        <Typography
          variant="caption"
          sx={{ color: color.note, mt: 1, fontWeight: "bold" }}
        >
          {note}
        </Typography>
      )}
    </Box>
  );
};

export default StudyCard;
