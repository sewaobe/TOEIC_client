import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Fade,
  FormHelperText,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Grow,
} from "@mui/material";

import { useNavigate, useSearchParams } from "react-router-dom";
import { TargetScoreStep } from "../../components/planWizard/Step1";
import { EndDateStep } from "../../components/planWizard/Step2";
import { DetailedPlanStep } from "../../components/planWizard/Step3";
import { HeaderPlanWizard } from "../../components/planWizard/Header";


// ==========================================================
// PlanStepper
// ==========================================================
function PlanStepper({ activeStep }: { activeStep: number }) {
  const steps = ["Điểm", "Thời gian kết thúc", "Kế hoạch chi tiết"];
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}><StepLabel>{label}</StepLabel></Step>
      ))}
    </Stepper>
  );
}

// ==========================================================
// Main component
// ==========================================================
export default function PlanWizardDemo() {
  const [searchParams] = useSearchParams();
  const scoreString = searchParams.get('score');
  const scoreNumber: number = scoreString ? parseFloat(scoreString) : 0;

  const [activeStep, setActiveStep] = React.useState<number>(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (activeStep > 2) {
      navigate("/programs")
    }
  }, [activeStep])
  // UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        // nền đẹp mắt hơn
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4ecf5 100%)", // pastel neutral gradient
        // có thể thử theme.palette.grey[100] hoặc ảnh pattern subtle
        display: "flex",
        flexDirection: "column",
        paddingY: "3%"
      }}
    >
      <Container
        className="max-w-[1000px] mx-auto p-4 sm:p-6 min-h-screen"
        sx={{
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.25)",
          bgcolor: "rgba(255,255,255,0.4)", // translucent khác với card trắng
          backdropFilter: "blur(20px)",     // morphin/glassy effect
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header sticky */}
        <HeaderPlanWizard />

        {/* Card */}
        <Card
          className="!rounded-xl shadow-lg"
          sx={{ border: "1px solid rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.10)", backdropFilter: "blur(16px)" }}
        >
          {/* Make CardContent a column so inner steps area can grow and scroll locally */}
          <CardContent className="p-4 sm:p-6" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Stepper */}
            <Box sx={{ mb: 3 }}>
              <PlanStepper activeStep={activeStep} />
            </Box>

            <Divider className="my-4" />

            {/* Steps */}
            {/* Steps container: allow vertical scrolling locally when content is long */}
            <Box sx={{ minHeight: 320, maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
              {activeStep === 0 && (
                <Grow in mountOnEnter unmountOnExit>
                  <Box>
                    <TargetScoreStep score={scoreNumber} />
                  </Box>
                </Grow>
              )}

              {activeStep === 1 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <EndDateStep score={scoreNumber} />
                    {/* {!!errors.endDate && <FormHelperText error sx={{ mt: 1 }}>{errors.endDate}</FormHelperText>} */}
                  </Box>
                </Fade>
              )}

              {activeStep === 2 && (
                <Fade in mountOnEnter unmountOnExit>
                  <Box>
                    <DetailedPlanStep />
                  </Box>
                </Fade>
              )}
            </Box>

            <Divider className="my-4" />

            {/* Footer actions */}
            <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="space-between">
              <Button variant="outlined" size="large" onClick={() => setActiveStep(prev => prev - 1)} disabled={activeStep === 0} fullWidth>
                Quay lại
              </Button>
              <Button variant="contained" size="large" onClick={() => setActiveStep(prev => prev + 1)} disabled={false} fullWidth>
                {activeStep < 2 ? "Tiếp tục" : "Bắt đầu"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
