import {
    Box,
    Button,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SchoolIcon from "@mui/icons-material/School";

export const HeaderPlanWizard = () => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="relative top-0 z-10"
            sx={{
                border: "1px solid", borderColor: "rgba(255,255,255,.15)",
                bgcolor: "rgba(255,255,255,.10)", backdropFilter: "blur(16px)",
                px: 2, py: 1, borderRadius: "16px", mb: 2,
            }}
        >
            <Button
                onClick={() => console.log("Back")} // hoặc logic của bạn
                startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                color="inherit"
                size="small"
                variant="text"
                sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 1.25,
                    py: 0.5,
                    lineHeight: 1.2,
                    borderRadius: 999,
                    // glassy pill
                    bgcolor: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)",
                    transition: "all .2s ease",
                    // text/icon màu xám trung tính để dịu mắt
                    "& .MuiButton-startIcon": { mr: 0.5 },
                    "&:hover": {
                        bgcolor: "rgba(255,255,255,0.16)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                    },
                    "&:active": {
                        transform: "translateY(0px)",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
                    },
                }}
            >
                Quay lại
            </Button>


            <Stack direction="row" alignItems="center" spacing={1}>
                <SchoolIcon color="primary" />
                <Typography variant="h4" fontWeight={800} letterSpacing={0.2}>
                    Tạo lộ trình học
                </Typography>
            </Stack>

            <Box width={40} /> {/* spacer */}
        </Stack>
    )
}