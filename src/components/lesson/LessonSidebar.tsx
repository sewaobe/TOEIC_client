import { Box, Chip } from "@mui/material";
import { LessonItem } from "../../types/Lesson";

export default function LessonQueue({
    lessons,
    currentLesson,
    onSelect,
}: {
    lessons: LessonItem[];
    currentLesson: LessonItem | null;
    onSelect: (t: LessonItem) => void;
}) {
    return (
        <Box>
            {/* Lesson Queue */}
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 5,
                    mt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: (t) =>
                        t.palette.mode === "light"
                            ? "rgba(255,255,255,0.92)"
                            : "rgba(20,24,33,0.86)",
                    backdropFilter: "blur(10px)",
                    px: 1.5,
                    py: 1,
                    borderRadius: "0 0 28px 28px",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        overflowX: "auto",
                        pb: 0.5,
                        "&::-webkit-scrollbar": { height: 8 },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "action.selected",
                            borderRadius: 999,
                        },
                    }}
                >
                    {lessons.map((ls, index) => {
                        const isActive = currentLesson?.id === ls.id;
                        const color =
                            ls.status === "completed"
                                ? "success"
                                : ls.status === "in_progress"
                                ? "default"
                                : "warning";
                        return (
                            <Chip
                                key={index}
                                label={ls.title}
                                color={color}
                                variant={isActive ? "filled" : "outlined"}
                                onClick={() => onSelect(ls)}
                                sx={{
                                    cursor: ls.status === "lock" ? "not-allowed" : "pointer",
                                    opacity: ls.status === "lock" ? 0.5 : 1,
                                    borderRadius: 2,
                                    fontWeight: isActive ? 700 : 500,
                                    "&.MuiChip-filled": {
                                        bgcolor:
                                            color === "success"
                                                ? "success.main"
                                                : "primary.main",
                                        color: "primary.contrastText",
                                    },
                                    "& .MuiChip-label": { px: 1.25 },
                                }}
                            />
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
