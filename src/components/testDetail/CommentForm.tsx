import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import {
  Avatar,
  Box,
  Button,
  TextField,
  useTheme,
  InputAdornment,
} from "@mui/material";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  autoFocus?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, autoFocus }) => {
  const [content, setContent] = useState("");
  const user = useSelector((state: RootState) => state.user.user!);
  const theme = useTheme();

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        my: 1.5,
      }}
    >
      <Avatar
        sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, mt: 0.5 }}
        src={user.profile.avatar || undefined}
      >
        {!user.profile.avatar && user.username?.[0]?.toUpperCase()}
      </Avatar>

      <TextField
        placeholder="Viết bình luận..."
        multiline
        maxRows={3} // Sửa ở đây
        fullWidth
        autoFocus={autoFocus}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            pr: 1,
            "&:hover fieldset": { borderColor: theme.palette.primary.main },
            "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
          },
          "& .MuiInputBase-input": { pl: 2.5 },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!content.trim()}
                sx={{
                  fontWeight: "bold",
                  px: 2,
                  py: 1,
                  whiteSpace: "nowrap",
                  borderRadius: 1,
                }}
              >
                Gửi
              </Button>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default CommentForm;