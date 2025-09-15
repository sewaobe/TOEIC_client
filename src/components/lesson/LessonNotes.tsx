import { Card, CardContent, Stack } from "@mui/material";
import Editor from "../common/Editor";

export default function LessonNotes() {
    return (
        <Card variant="outlined" className="rounded-3xl">
            <CardContent className="py-4 sm:py-6">
                <Stack spacing={1}>
                    <Editor />
                </Stack>
            </CardContent>
        </Card>
    );
}
