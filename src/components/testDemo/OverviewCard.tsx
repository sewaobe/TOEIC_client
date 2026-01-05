import { Card, CardContent, Typography, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import { FC } from "react";
import { useSearchParams } from "react-router-dom";

export interface SkillInfo {
  name: string;
  questions: number;
  timeMinutes: number;
}

interface OverviewCardProps {
  totalScore: number;
  totalTimeMinutes: number;
  skills: SkillInfo[];
  description: string;
  isFullTest?: boolean;
}

export const OverviewCard: FC<OverviewCardProps> = ({
  totalScore,
  totalTimeMinutes,
  skills,
  description,
  isFullTest = true,
}) => {
  const [searchParams] = useSearchParams();

  const theme = useTheme();
  const navigate = useNavigate();

  const handleStart = () => {
    const queryString = searchParams.toString(); // giữ nguyên tất cả query hiện tại
    navigate(`/test?${queryString}`);
  };

  return (
    <div className="w-full flex justify-center items-start py-8">
      <Card
        sx={{
          maxWidth: isFullTest ? 600 : 800,
          width: "100%",
          borderRadius: 3,
          boxShadow: theme.shadows[4],
          bgcolor: "background.paper",
        }}
        className="p-6"
      >
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <SchoolIcon fontSize="large" color="primary" />
            <Typography variant="h4" component="div">
              {isFullTest
                ? "TOEIC 2 Skills Overview"
                : "TOEIC Practice Overview"}
            </Typography>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <Typography variant="h6" color="text.secondary">
              Tổng số câu: {totalScore}
            </Typography>
            <Typography variant="h6" color="primary">
              Thời gian: {totalTimeMinutes} phút
            </Typography>
          </div>

          <div
            className={`grid ${
              isFullTest ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            } gap-4`}
          >
            {skills.map((skill, index) => (
              <div
                key={index}
                className="p-4 border rounded-md dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700"
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                >
                  {skill.name}
                </Typography>
                <div className="mt-2 space-y-1">
                  <Typography
                    variant="body2"
                    className="flex items-center gap-2"
                  >
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    Số câu: <strong>{skill.questions}</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    className="flex items-center gap-2"
                  >
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Thời gian: <strong>{skill.timeMinutes} phút</strong>
                  </Typography>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          </div>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStart}
            className="self-center w-full sm:w-auto"
            sx={{
              py: 1.5,
              px: 6,
              fontSize: "1.1rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Bắt đầu {isFullTest ? "Full Test" : "Luyện tập"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
