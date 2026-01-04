import {
  Button,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import {
  ArrowBack,
  Settings,
  VisibilityOff,
  EventBusy,
  Style,
  GridView,
  Keyboard,
  Check,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

export type PracticeMode = "flashcard" | "matching" | "recall";

interface MenuProps {
  currentMode?: PracticeMode;
  onModeChange?: (mode: PracticeMode) => void;
}

const MODE_CONFIG = {
  flashcard: {
    label: "Flashcard",
    description: "Lật thẻ học từ vựng",
    icon: Style,
  },
  matching: {
    label: "Matching Game",
    description: "Ghép cặp từ - nghĩa",
    icon: GridView,
  },
  recall: {
    label: "Word Recall",
    description: "Gõ từ theo nghĩa",
    icon: Keyboard,
  },
};

export default function Menu({
  currentMode = "flashcard",
  onModeChange,
}: MenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (mode: PracticeMode) => {
    onModeChange?.(mode);
    handleClose();
  };

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2 items-center flex-nowrap ">
        <Button
          startIcon={<ArrowBack sx={{ color: "primary.main" }} />}
          variant="text"
          sx={{
            color: "grey.700",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
          }}
          onClick={() =>
            navigate(
              location.pathname.substring(0, location.pathname.lastIndexOf("/"))
            )
          }
        >
          Xem tất cả
        </Button>
        <Button
          startIcon={<Settings sx={{ color: "primary.main" }} />}
          variant="text"
          sx={{
            color: "grey.700",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
          }}
          onClick={handleClick}
        >
          Chế độ: {MODE_CONFIG[currentMode].label}
        </Button>

        <MuiMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          disableScrollLock
          PaperProps={{
            sx: { minWidth: 280 },
          }}
        >
          {(Object.keys(MODE_CONFIG) as PracticeMode[]).map((mode) => {
            const config = MODE_CONFIG[mode];
            const ModeIcon = config.icon;
            const isSelected = currentMode === mode;

            return (
              <MenuItem
                key={mode}
                onClick={() => handleModeSelect(mode)}
                selected={isSelected}
                sx={{
                  py: 1.5,
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                    borderLeft: "4px solid #2563EB",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <ModeIcon color={isSelected ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText
                  primary={config.label}
                  secondary={config.description}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "primary" : "inherit",
                  }}
                />
                {isSelected && <Check color="primary" sx={{ ml: 1 }} />}
              </MenuItem>
            );
          })}
        </MuiMenu>
        <Button
          startIcon={<VisibilityOff sx={{ color: "primary.main" }} />}
          variant="text"
          sx={{
            color: "grey.700",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
          }}
        >
          Các từ đã bỏ qua
        </Button>
      </div>
      <div>
        <Button
          startIcon={<EventBusy />}
          variant="text"
          sx={{
            color: "red",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
          }}
        >
          Dừng học list từ này
        </Button>
      </div>
    </div>
  );
}
