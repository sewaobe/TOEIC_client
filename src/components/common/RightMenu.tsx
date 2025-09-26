import { useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface RightMenuDrawerProps {
  setShowNotebook: (show: boolean) => void;
}
export default function RightMenuDrawer({setShowNotebook}: RightMenuDrawerProps) {
  const [open, setOpen] = useState(true); // ✅ mặc định mở

  const items = [
    {
      label: "Sổ tóm tắt",
      icon: <MenuBookIcon sx={{ color: "#388e3c" }} />, // xanh lá
      onClick: () => setShowNotebook(true),
    },
    {
      label: "Từ điển",
      icon: <DescriptionIcon sx={{ color: "#1976d2" }} />, // xanh dương
      onClick: () => alert("Đi tới Từ điển"),
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
          ? "translateX(0) translateY(-50%)"
          : "translateX(80%) translateY(-50%)",
        transition: "transform 0.3s ease-in-out",
        width: open ? 64 : 48, // chỉ đủ chứa icon
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Toggle nút */}
      <IconButton
        onClick={() => setOpen(!open)}
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
      {open && (
        <List sx={{ p: 1 }}>
          {items.map((item) => (
            <Tooltip key={item.label} title={item.label} placement="left">
              <ListItemButton
                onClick={item.onClick}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      )}
    </Box>
  );
}
