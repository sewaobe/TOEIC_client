import * as React from "react";
import {
    Stack, Tabs, Tab, Typography,
    Table, TableHead, TableRow, TableCell, TableBody, Chip, Card, CardContent
} from "@mui/material";

import { mapAnswersToParts } from "../../utils/mapAnswersToParts";
import type { RawAnswer } from "../../utils/mapAnswersToParts";
import { examParts } from "../../constants/examParts";

function Bubble({ n, status }: { n: number; status: "correct" | "wrong" | "skipped" }) {
    const color =
        status === "correct" ? "success" :
            status === "wrong" ? "error" : "default";

    return (
        <Chip
            size="small"
            label={n}
            color={color as any}
            variant="outlined"
            className="rounded-full"
            sx={{ width: 32, height: 32, fontSize: "11px", "& .MuiChip-label": { px: 0 } }}
        />
    );
}


export default function DetailAnalysis({ answers }: { answers: RawAnswer[] }) {
    const [tab, setTab] = React.useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

    // Gom theo Part từ util (đúng type, không cần cast)
    const parts = mapAnswersToParts(answers);

    console.log("Parts", parts);
    const renderBubble = (part: RawAnswer[]) => {
        return (
            <Stack direction="row" gap={1} flexWrap="wrap">
                {part.map(question => {
                    const question_status = question.isCorrect === true ? "correct" : (question.selectedOption === "" ? "skipped" : "wrong");
                    return <Bubble key={question.question_no} n={question.question_no} status={question_status} />
                })}
            </Stack>
        )
    }
    const renderBody = () => {
        const tagsByPart = examParts[tab].tags.map(tag => tag.name);
        const count_correct_question = parts[tab].filter(part => part.isCorrect === true).length;
        const count_incorrect_question = parts[tab].filter(part => part.isCorrect === false && part.selectedOption !== "").length;
        return (
            <>
                {tagsByPart.map(tagByPart => {
                    return (
                        <TableRow key={tagByPart}>
                            <TableCell>{tagByPart}</TableCell>
                            <TableCell>{0}</TableCell>
                            <TableCell>{0}</TableCell>
                            <TableCell>{0}</TableCell>
                            <TableCell>{0}</TableCell>
                            <TableCell>{renderBubble(parts[tab])}</TableCell>
                        </TableRow>
                    )
                })}
            </>
        )
    }


    return (
        <Card elevation={0} className="rounded-2xl border border-gray-200 dark:border-gray-700">
            <CardContent>
                <Typography variant="h6" className="font-semibold mb-3">Phân tích chi tiết</Typography>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    sx={{
                        mb: 1,
                        "& .MuiTab-root": {
                            textTransform: "none",
                            borderRadius: "9999px",
                            minHeight: 36,
                            mr: 1,
                            px: 2
                        }
                    }}
                >
                    <Tab label="Part 1" value={1} />
                    <Tab label="Part 2" value={2} />
                    <Tab label="Part 3" value={3} />
                    <Tab label="Part 4" value={4} />
                    <Tab label="Part 5" value={5} />
                    <Tab label="Part 6" value={6} />
                    <Tab label="Part 7" value={7} />
                    <Tab label="Tổng quát" value={0} />
                </Tabs>

                <Table
                    size="small"
                    sx={{ mt: 1, }}
                >
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "action.hover" }}>
                            <TableCell>Phân loại câu hỏi</TableCell>
                            <TableCell align="left">Số câu đúng</TableCell>
                            <TableCell align="left">Số câu sai</TableCell>
                            <TableCell align="left">Số câu bỏ qua</TableCell>
                            <TableCell align="left">Độ chính xác</TableCell>
                            <TableCell>Danh sách câu hỏi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderBody()}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
