import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";
import { LessonItem } from "../../types/Lesson";

export default function LessonHeader({ lesson }: { lesson: LessonItem | null }) {
    const navigate = useNavigate();
    console.log(lesson);
    return (
        <Box className="sticky top-0 z-10"
            sx={{ border: "1px solid rgba(0,0,0,0.06)", px: 2, py: 1.25, borderRadius: "16px", mb: 2, position: "relative" }}>
            <Button
                startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                variant="text"
                color="inherit"
                size="small"
                onClick={() => navigate("/programs")}
                sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}
            >
                Thoát
            </Button>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <SchoolIcon color="primary" />
                <Typography variant="h5" fontWeight={900}>
                    {lesson ? `${lesson.title}` : "Bài học"}
                </Typography>
            </Stack>
        </Box>
    );
}
