import React, { useReducer } from "react";
import { Avatar, Box, Typography, Button, useTheme } from "@mui/material";
import CommentForm from "./CommentForm";
import { IComment } from "../../types/comment.type";
import commentService from "../../services/comment.service";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// ==== types ====
interface CommentItemProps {
  comment: IComment & { replyCount?: number };
  depth?: number;
}

interface State {
  showReplies: boolean;
  replies: IComment[];
  replying: boolean;
  replyCount: number;
  page: number;
  hasMore: boolean;
}

type Action =
  | { type: "TOGGLE_REPLIES" }
  | { type: "SET_REPLIES"; payload: IComment[]; reset?: boolean }
  | { type: "ADD_REPLY"; payload: IComment }
  | { type: "SET_REPLYING"; payload: boolean }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_HAS_MORE"; payload: boolean };

// ==== reducer ====
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "TOGGLE_REPLIES":
      return { ...state, showReplies: !state.showReplies };
    case "SET_REPLIES":
      return action.reset
        ? { ...state, replies: action.payload }
        : { ...state, replies: [...state.replies, ...action.payload] };
    case "ADD_REPLY":
      return {
        ...state,
        replies: [action.payload, ...state.replies],
        replyCount: state.replyCount + 1,
      };
    case "SET_REPLYING":
      return { ...state, replying: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    default:
      return state;
  }
};

const CommentItem: React.FC<CommentItemProps> = ({ comment, depth = 0 }) => {
  const theme = useTheme();
  const [state, dispatch] = useReducer(reducer, {
    showReplies: false,
    replies: [],
    replying: false,
    replyCount: comment.replyCount || 0,
    page: 1,
    hasMore: true,
  });

  const { showReplies, replies, replying, replyCount, page, hasMore } = state;

  // ==== handlers ====
  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      await loadReplies(1);
    }
    dispatch({ type: "TOGGLE_REPLIES" });
  };

  const loadReplies = async (pageToLoad: number) => {
    const limit = 3;
    const res = await commentService.getRepliesByComment(
      comment._id,
      pageToLoad,
      limit
    );

    if (pageToLoad === 1) {
      dispatch({ type: "SET_REPLIES", payload: res.comments, reset: true });
    } else {
      dispatch({ type: "SET_REPLIES", payload: res.comments });
    }

    dispatch({ type: "SET_PAGE", payload: pageToLoad });

    const loaded = pageToLoad * limit;
    if (loaded >= res.pagination.total) {
      dispatch({ type: "SET_HAS_MORE", payload: false });
    }
  };

  const handleLoadMore = () => {
    loadReplies(page + 1);
  };

  const handleSubmit = async (text: string) => {
    const newReply = await commentService.createComment(
      comment.test_id,
      text,
      comment._id
    );
    dispatch({ type: "ADD_REPLY", payload: newReply });
    dispatch({ type: "SET_REPLYING", payload: false });
  };

  return (
    <Box sx={{ 
      ml: depth > 0 ? 5 : 0, 
      mb: 2, 
      position: 'relative' 
    }}>
      {/* Connector Line for nested comments */}
      {depth > 0 && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: -20,
          width: '1px',
          height: '100%',
          backgroundColor: theme.palette.divider,
        }} />
      )}

      {/* Comment box */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          p: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <Avatar src={comment.user_id.profile.avatar || undefined}>
          {!comment.user_id.profile.avatar &&
            comment.user_id.username[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {comment.user_id.profile.fullname}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color={theme.palette.text.secondary}
            >
              • {new Date(comment.create_at).toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="body2" color={theme.palette.text.primary} sx={{ mb: 1 }}>
            {comment.content}
          </Typography>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {replyCount > 0 && (
              <Button
                size="small"
                onClick={handleToggleReplies}
                sx={{
                  textTransform: "none",
                  color: theme.palette.primary.main,
                }}
              >
                {showReplies ? "Ẩn trả lời" : `Xem ${replyCount} trả lời`}
              </Button>
            )}
            {depth < 2 && (
              <Button
                size="small"
                onClick={() =>
                  dispatch({ type: "SET_REPLYING", payload: !replying })
                }
                sx={{
                  textTransform: "none",
                  color: theme.palette.text.secondary,
                }}
              >
                Trả lời
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Reply form */}
      {replying && depth < 2 && (
        <Box sx={{ mt: 2, pl: 2 }}>
          <CommentForm autoFocus onSubmit={handleSubmit} />
        </Box>
      )}

      {/* Replies */}
      {showReplies && (
        <Box sx={{ mt: 2 }}>
          {replies.map((r) => (
            <CommentItem key={r._id} comment={r} depth={depth + 1} />
          ))}
          {hasMore && (
            <Button
              variant="text"
              size="small"
              onClick={handleLoadMore}
              sx={{
                textTransform: "none",
                mt: 1,
                ml: 2,
                color: theme.palette.primary.main,
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: '10px', mr: 1 }} /> Xem thêm trả lời
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CommentItem;