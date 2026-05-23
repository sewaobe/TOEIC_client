import { FC } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";

const partnerLogos = ["ETS", "British Council", "IDP", "Oxford"];

const SocialProof: FC = () => {
  return (
    <Box component="section" sx={{ pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 4 }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {["A", "B", "C"].map((label, index) => (
                <Box
                  key={label}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                    fontWeight: 700,
                    fontSize: 14,
                    marginLeft: index === 0 ? 0 : -8,
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Hơn 50,000+ học viên đã tin tưởng TOEIC Smart
            </Typography>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center">
            {partnerLogos.map((logo) => (
              <Typography
                key={logo}
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  color: "text.secondary",
                  textTransform: "uppercase",
                }}
              >
                {logo}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default SocialProof;
