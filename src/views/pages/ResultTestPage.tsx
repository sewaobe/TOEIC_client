import { Box, Button, Stack, Typography } from "@mui/material"

import MainLayout from "../layouts/MainLayout";
import { SecondLayout } from "../layouts/SecondLayout";
import { OverallAnalysis } from "../../components/testResult/OverallAnalysis";
import { getPartFromTags, RawAnswer } from "../../utils/mapAnswersToParts";
import DetailAnalysis from "../../components/testResult/DetailAnalysis";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import userTestService from "../../services/user_test.service";

const ResultTestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { historyId } = useParams<{ historyId: string }>();
    const [testDetail, setTestDetail] = useState<{
        score: number,
        answers: RawAnswer[],
        completedPart: string,
        duration: number;
        submit_at: Date
    }>();
    const tab_parts: string[] = testDetail
        ? [
            ...new Set(
                testDetail.answers
                    .flatMap((ans) => ans.tags)
                    .map((tag) => tag!.match(/\[Part (\d+)\]/)?.[1])
                    .filter(Boolean) as string[]
            ),
        ]
        : [];


    const total_correct_question = testDetail ? testDetail.answers.filter(q => q.isCorrect === true).length : 0;
    const total_incorrect_question = testDetail ? testDetail.answers.filter(q => q.isCorrect === false && q.selectedOption !== "").length : 0;

    const total_correct_listening = testDetail
        ? testDetail.answers.filter((q) => {
            const part = getPartFromTags(q.tags);
            return part !== undefined && q.isCorrect && part >= 1 && part <= 4;
        }).length
        : 0;

    const total_correct_reading = testDetail
        ? testDetail.answers.filter((q) => {
            const part = getPartFromTags(q.tags);
            return part !== undefined && q.isCorrect && part >= 5 && part <= 7;
        }).length
        : 0;


    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (historyId) {
                    const data = await userTestService.getTestHistoryDetail(historyId)
                    setTestDetail(data);
                }
            }
            catch (error) {
                console.error(error)
            }
        }
        fetchDetail();
    }, [])

    return (
        <MainLayout>
            <SecondLayout>
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    sx={{
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 1,
                    }}
                >
                    {/* Header - Title*/}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Kết quả thi: New Economy TOEIC Test 1
                        </Typography>
                        <Button variant="contained" size="small" onClick={() => navigate(location.pathname.substring(0, location.pathname.lastIndexOf("/result")))}>Quay về trang đề thi</Button>
                    </Stack>

                    {/* Section Analysis */}
                    {testDetail && <OverallAnalysis
                        completion_time={testDetail.duration}
                        correct_question={total_correct_question}
                        incorrect_question={total_incorrect_question}
                        skip_question={testDetail.answers.length - total_correct_question - total_incorrect_question}
                        total_score={testDetail.score}
                        correct_listening={total_correct_listening}
                        correct_reading={total_correct_reading} />
                    }

                    {/* Section Detail Analysis */}
                    <div className="mt-4">
                        {
                            testDetail && <DetailAnalysis answers={testDetail?.answers} tab_parts={tab_parts} />
                        }

                    </div>
                </Box >
            </SecondLayout>
        </MainLayout>

    )
}

export default ResultTestPage;