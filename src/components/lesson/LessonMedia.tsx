import { Card, CardContent, Box, Typography } from "@mui/material";

export default function LessonMedia() {
    return (
        <Card variant="outlined" className="rounded-3xl" sx={{ mb: 2 }}>
            <CardContent className="p-4 sm:p-6">
                <Box sx={{
                    width: "100%", aspectRatio: "16/9", borderRadius: "16px",
                    bgcolor: "#F2F4F8", border: "1px dashed rgba(0,0,0,0.15)",
                    display: "grid", placeItems: "center"
                }}>
                    <Typography color="text.secondary">Khung video/audio/đọc</Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
