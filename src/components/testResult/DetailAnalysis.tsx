import * as React from "react";
import {
    Stack, Tabs, Tab, Typography,
    Table, TableHead, TableRow, TableCell, TableBody, Chip, Card, CardContent,
    TableFooter
} from "@mui/material";

import { mapAnswersToParts } from "../../utils/mapAnswersToParts";
import type { RawAnswer } from "../../utils/mapAnswersToParts";

function Bubble({ question, status, setSelected }: { question: RawAnswer; status: "correct" | "wrong" | "skipped"; setSelected?: (answer: RawAnswer | null) => void }) {
    const color =
        status === "correct" ? "success" :
            status === "wrong" ? "error" : "default";

    return (
        <Chip
            size="small"
            label={question.question_no}
            color={color as any}
            variant="outlined"
            className="rounded-full !cursor-pointer"
            sx={{ width: 32, height: 32, fontSize: "11px", "& .MuiChip-label": { px: 0 } }}
            onClick={() => {
                if (setSelected) setSelected(question);
            }} />
    );
}


export default function DetailAnalysis({ answers, tab_parts, setSelected }: { answers: RawAnswer[], tab_parts: string[], setSelected: (answer: RawAnswer | null) => void }) {
    const [tab, setTab] = React.useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

    // Gom theo Part từ util (đúng type, không cần cast)
    const parts = mapAnswersToParts(answers);

    const renderBubble = (part: RawAnswer[]) => {
        return (
            <Stack direction="row" gap={1} flexWrap="wrap">
                {part.map(question => {
                    const question_status = question.isCorrect === true ? "correct" : (question.selectedOption === "" ? "skipped" : "wrong");
                    return <Bubble key={question.question_no} question={question} status={question_status} setSelected={setSelected} />
                })}
            </Stack>
        )
    }
    const renderBody = () => {
        // Nếu tab = 0 => gom tất cả parts lại
        const data = tab === 0 ? Object.values(parts).flat() : parts[tab];

        const tagsByPart = data
            .flatMap((q) => q.tags)
            .filter((tag, idx, arr) => arr.indexOf(tag) === idx);

        return (
            <>
                {tagsByPart.map((tagByPart) => {
                    const questionsWithTag = data.filter((q) =>
                        q?.tags?.includes(tagByPart!)
                    );

                    const count_correct_question = questionsWithTag.filter(q => q.isCorrect === true).length;
                    const count_incorrect_question = questionsWithTag.filter(q => q.isCorrect === false && q.selectedOption !== "").length;
                    const count_skip_question = questionsWithTag.length - count_correct_question - count_incorrect_question;

                    return (
                        <TableRow key={tagByPart}>
                            <TableCell>{tagByPart}</TableCell>
                            <TableCell>{count_correct_question}</TableCell>
                            <TableCell>{count_incorrect_question}</TableCell>
                            <TableCell>{count_skip_question}</TableCell>
                            <TableCell>
                                {(count_correct_question + count_incorrect_question) === 0
                                    ? 0
                                    : Math.round((count_correct_question * 100) / (count_correct_question + count_incorrect_question))}%
                            </TableCell>
                            <TableCell>{renderBubble(questionsWithTag)}</TableCell>
                        </TableRow>
                    );
                })}
            </>
        );
    };

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
                    {tab_parts.map(tab => {
                        return (
                            <Tab key={`part-${tab}`} label={`Part ${tab}`} value={parseInt(tab)} />
                        )
                    })}
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
                    <TableFooter>
                        {(() => {
                            const data = tab === 0 ? Object.values(parts).flat() : parts[tab];
                            const correct = data.filter(q => q.isCorrect === true).length;
                            const incorrect = data.filter(q => q.isCorrect === false && q.selectedOption !== "").length;
                            const skip = data.length - correct - incorrect;
                            const accuracy = (correct + incorrect) === 0 ? 0 : Math.round((correct * 100) / (correct + incorrect));

                            return (
                                <TableRow
                                    sx={{
                                        backgroundColor: "action.hover",
                                        "& td": { fontWeight: "900", fontSize: "0.9rem" },
                                    }}
                                >
                                    <TableCell>Tổng</TableCell>
                                    <TableCell>{correct}</TableCell>
                                    <TableCell>{incorrect}</TableCell>
                                    <TableCell>{skip}</TableCell>
                                    <TableCell>{accuracy}%</TableCell>
                                    <TableCell />
                                </TableRow>
                            );
                        })()}
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
}
