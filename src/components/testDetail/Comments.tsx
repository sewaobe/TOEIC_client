import { forwardRef, useEffect, useState } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import commentService from "../../services/comment.service";
import { IComment } from "../../types/comment.type";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentsProps {
  testId: string;
}

const Comments = forwardRef<HTMLDivElement, CommentsProps>(
  ({ testId }, ref) => {
    const theme = useTheme();
    const [comments, setComments] = useState<IComment[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch comment list
    useEffect(() => {
      const fetchComments = async () => {
        try {
          const res = await commentService.getCommentsByTest(testId, page, 5);
          setComments((prev) => [...prev, ...res.comments]);
          setHasMore(page < res.pagination.totalPages);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
      fetchComments();
    }, [testId, page]);

    // Submit new comment
    const handleSubmit = async (content: string) => {
      if (!content.trim()) return;

      try {
        const newComment = await commentService.createComment(testId, content);
        setComments((prev) => [newComment, ...prev]);
      } catch (error) {
        console.error("Error creating comment:", error);
      }
    };

    return (
      <Box ref={ref} sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        {/* Tiêu đề */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.text.primary }}>
          Bình luận
        </Typography>

        {/* Form bình luận chính */}
        <CommentForm onSubmit={(text) => handleSubmit(text)} />

        {/* Danh sách */}
        <Box sx={{ mt: 3 }}>
          {comments.map((cmt) => (
            <CommentItem key={cmt._id} comment={cmt} />
          ))}
        </Box>

        {/* Xem thêm */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={() => setPage((p) => p + 1)}>
              Xem thêm
            </Button>
          </Box>
        )}
      </Box>
    );
  }
);

Comments.displayName = "Comments";
export default Comments;