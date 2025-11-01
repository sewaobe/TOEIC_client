import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

interface RightMenuDrawerProps {
  onShowNotebook: (show: boolean) => void;
  onShowProgress: (show: boolean) => void;
  onShowChatbot: (show: boolean) => void;
  onShowReport: (show: boolean) => void;
}

export default function RightMenuDrawer({
  onShowNotebook,
  onShowProgress,
  onShowChatbot,
  onShowReport,
}: RightMenuDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedOpen = localStorage.getItem("rightMenuOpen");
    if (storedOpen !== null) {
      setOpen(JSON.parse(storedOpen));
    }
  }, []);

  const items = [
    {
      label: "Sổ tóm tắt",
      icon: <AutoStoriesIcon sx={{ color: "#ef5350" }} />,
      onClick: () => onShowNotebook(true),
    },
    {
      label: "Tiến độ học tập",
      icon: <LeaderboardIcon sx={{ color: "#009688" }} />,
      onClick: () => onShowProgress(true),
    },
    {
      label: "Báo lỗi",
      icon: <ReportProblemIcon sx={{ color: "#f59e0b" }} />,
      onClick: () => onShowReport(true),
    },
    {
      label: "Từ điển",
      icon: <SpellcheckIcon sx={{ color: "#4527a0" }} />,
      onClick: () => alert("Đi tới Từ điển"),
    },
    {
      label: "Trợ lý luyện tập",
      icon: <SmartToyIcon sx={{ color: "#3b82f6" }} />,
      onClick: () => onShowChatbot(true),
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        top: "30%",
        right: 0,
        height: "auto",
        bgcolor: "white",
        borderRadius: "12px 0 0 12px",
        boxShadow: 4,
        zIndex: 1200,
        transform: open
          ? "translateX(0) translateY(-48%)"
          : "translateX(110%) translateY(-48%)",
        transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out",
        width: open ? 64 : 48,
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Toggle nút */}
      <IconButton
        onClick={() => {
          setOpen(!open);
          localStorage.setItem("rightMenuOpen", JSON.stringify(!open));
        }}
        sx={{
          position: "absolute",
          left: -36,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "white",
          boxShadow: 2,
          border: "1px solid #e0e0e0",
          "&:hover": { bgcolor: "#f5f5f5" },
        }}
      >
        {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      {/* List menu */}
      {/* Luôn render List để giữ chiều cao, nhưng ẩn icon đi */}
      <List sx={{ p: 1, transition: "opacity 0.3s", opacity: open ? 1 : 0 }}>
        {items.map((item) => (
          <Tooltip key={item.label} title={item.label} placement="left">
            <ListItemButton
              onClick={item.onClick}
              sx={{
                borderRadius: "12px",
                mb: 1,
                justifyContent: "center",
                p: 1.5,
                "&:hover": {
                  bgcolor: "#f0f0f0",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: "auto" }}>{item.icon}</ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
}
