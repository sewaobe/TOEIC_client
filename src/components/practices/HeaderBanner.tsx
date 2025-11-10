import { Box, Typography, IconButton, Tooltip, LinearProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";

/**
 * HeaderBannerPro Component
 * - Left: Nút quay lại
 * - Center: Tiêu đề + mô tả + tiến độ (số + thanh)
 * - Right: Icon hướng dẫn cố định
 */
interface HeaderBannerProps {
    title: string;             // Tiêu đề chính
    subtitle?: string;         // Mô tả nhẹ / hướng dẫn ngắn
    progress?: number;         // Tiến độ 0–100 (%)
    progressLabel?: string;    // Dòng mô tả tiến độ (VD: "4/10")
    showBackButton?: boolean;
    onBack?: () => void;
    onGuideClick?: () => void;
}

export const HeaderBanner = ({
    title,
    subtitle,
    progress,
    progressLabel,
    showBackButton = true,
    onBack,
    onGuideClick,
}: HeaderBannerProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    return (
        <Box
            sx={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                color: "#fff",
                borderRadius: "20px",
                py: { xs: 2.5, md: 3 },
                px: { xs: 2, md: 4 },
                mb: 4,
                boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
            }}
        >
            {/* Hiệu ứng nền */}
            <Box
                sx={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 160,
                    height: 160,
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    filter: "blur(40px)",
                }}
            />

            {/* LEFT: Nút quay lại */}
            <Box sx={{ zIndex: 1 }}>
                {showBackButton && (
                    <Tooltip title="Quay lại" arrow>
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                color: "#fff",
                                "&:hover": { background: "rgba(255,255,255,0.1)" },
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* CENTER: Tiêu đề + mô tả + tiến độ */}
            <Box
                sx={{
                    flex: 1,
                    textAlign: "center",
                    zIndex: 1,
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                        letterSpacing: "0.5px",
                        color: "#fff",
                    }}
                >
                    {title}
                </Typography>

                {subtitle && (
                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            opacity: 0.9,
                            color: "#f1f5f9",
                            fontStyle: "italic",
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}

                {/* Tiến độ: 4/10 [====] */}
                {progress !== undefined && (
                    <Box
                        sx={{
                            mt: 1.2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                            px: { xs: 4, md: 16 },
                        }}
                    >
                        {progressLabel && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#fef9c3",
                                    fontWeight: 600,
                                    letterSpacing: "0.3px",
                                    minWidth: 50,
                                    textAlign: "right",
                                }}
                            >
                                {progressLabel}
                            </Typography>
                        )}
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "rgba(255,255,255,0.25)",
                                "& .MuiLinearProgress-bar": {
                                    background:
                                        "linear-gradient(90deg, #facc15 0%, #fbbf24 100%)",
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* RIGHT: Icon hướng dẫn */}
            <Box sx={{ zIndex: 1 }}>
                <Tooltip title="Tour hướng dẫn" arrow>
                    <IconButton
                        onClick={onGuideClick}
                        sx={{
                            color: "#fff",
                            "&:hover": {
                                background: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};
