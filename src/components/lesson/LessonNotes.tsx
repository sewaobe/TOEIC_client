import * as React from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Divider,
  Avatar,
  Rating,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditNote";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";
import SummaryIcon from "@mui/icons-material/Summarize";
import LessonTakeNotes from "./LessonTakeNotes";
import FeedbackIcon from "@mui/icons-material/Feedback";

/* ----------------------- Mock data ----------------------- */
// Generate ~50 mock comments dynamically
const generateComments = () => {
  const names = [
    "Minh Anh", "Quốc Huy", "Lan Phương", "Tuấn Anh", "Linh Chi",
    "Hồng Nhung", "Thanh Hương", "Gia Bảo", "Khánh Linh", "Mạnh Tuấn",
    "Thảo Nguyên", "Đức Minh", "Phương Linh", "Trung Kiên", "Bảo Châu",
    "Vân Anh", "Hải Đăng", "Tâm Anh", "Hoài Phong", "Thị Hương",
    "Chí Công", "Diễn Thị", "Gia Nhu", "Hải Yến", "Khắc Vinh",
  ];
  const contents = [
    "Phần hội thoại Part 3 khá rõ, có nhiều paraphrase. Mẹo note keyword ở 5–10s đầu giúp bắt kịp mạch câu hỏi.",
    "Từ vựng về lịch trình (reschedule, postpone, itinerary) xuất hiện dày. Nên làm flashcards.",
    "Part 7 đoạn đơn dễ nhầm distractor dạng số liệu. Hãy gạch chân units trước khi đọc đáp án.",
    "Bài này giúp tôi nắm rõ hơn về các cụm từ collocation. Tuyệt vời!",
    "Part 5 khá challenging, cần practice nhiều hơn nữa.",
    "Listening comprehension ở đây rất tốt. Các bài tập nghe khá bổ ích.",
    "Tôi thích cách giải thích của bạn. Dễ hiểu và chi tiết.",
    "Speaking tips rất hữu ích, sẽ áp dụng ngay.",
    "Reading section quá dài, nhưng nội dung chất lượng cao.",
    "Vocabulary coverage khá toàn diện. Ghi chú thêm được nhiều từ mới.",
    "Grammar explanations rất clear. Thanks for breaking it down!",
    "Cấu trúc bài học logic, dễ theo dõi từ đầu đến cuối.",
    "Phần practice exercises rất giúp ích cho mình.",
    "Audio quality tốt, nghe rõ từng từ.",
    "Timing của bài học vừa đủ, không quá dài hay quá ngắn.",
    "Các ví dụ minh họa rất sống động và dễ nhớ.",
    "Bạn nên thêm flashcards practice vào bài.",
    "Phần luyện tập interactive rất hấp dẫn.",
    "Tôi recommend bài này cho bạn bè của mình.",
    "Giải thích chi tiết và rõ ràng. 5 sao!",
    "Content quality tuyệt vời, keep it up!",
    "Bài giảng cấu trúc tốt, dễ nắm bắt.",
    "Tôi học được rất nhiều từ bài này.",
    "Video quality cao, hình ảnh rõ nét.",
    "Transcript được cung cấp đầy đủ, thuận tiện.",
    "Tốc độ nói rõ ràng, không quá nhanh.",
    "Điều chỉnh playback speed rất tiện lợi.",
    "Nội dung cập nhật và phù hợp với đề thi hiện tại.",
    "Bài tập consolidation giúp ôn lại tốt.",
    "Không quá phức tạp nhưng cũng không quá dễ.",
    "Layout của trang học rất clean và dễ sử dụng.",
    "Phần note-taking có sẵn giúp tôi ghi lại key points.",
    "Âm thanh background không quá lớn, hoàn toàn chấp nhận được.",
    "Tôi thích cách phân chia phần khó thành bite-size chunks.",
    "Bạn nên thêm quiz sau mỗi section để kiểm tra hiểu biết.",
    "Content từng phần rất organized và logic.",
    "Mình thích interactive elements trong bài giảng.",
    "Đây là một trong những bài học tốt nhất mà tôi từng học.",
    "Thậm chí áp dụng ngay những tips vào kỳ thi thử.",
    "Lớp tôi cùng học bài này và đều thích lắm.",
    "Lecturer giải thích rất tận tình và chi tiết.",
    "Tài liệu bổ trợ được tổ chức rất khoa học.",
    "Phần cuối cùng của bài học là highlight của tôi.",
    "Tôi đã luyện tập lại phần này 3 lần rồi.",
    "Cảm ơn vì đã tạo ra một bài học chất lượng như này.",
    "Sẽ quay lại bài này để review trước kỳ thi chính.",
    "Mấy bạn trẻ nên học bài này để nâng level English.",
    "Amazing content! Definitely worth your time.",
    "10/10 would recommend to anyone preparing for TOEIC.",
  ];

  const comments = [];
  for (let i = 0; i < 50; i++) {
    const nameIndex = i % names.length;
    const contentIndex = i % contents.length;
    const ratingOptions = [3, 3.5, 4, 4.5, 5];
    const timeOptions = [
      "1 giờ trước", "2 giờ trước", "hôm qua", "2 ngày trước", "3 ngày trước",
      "1 tuần trước", "2 tuần trước", "1 tháng trước"
    ];

    comments.push({
      id: `c${i + 1}`,
      user: {
        name: names[nameIndex],
        avatar: `https://i.pravatar.cc/100?img=${(i % 20) + 1}`,
      },
      rating: ratingOptions[i % ratingOptions.length],
      content: contents[contentIndex],
      time: timeOptions[i % timeOptions.length],
    });
  }
  return comments;
};

const comments = generateComments();

// Fetch comments with pagination
const fetchComments = async (page: number, pageSize: number = 10) => {
  // Simulate API call delay
  return new Promise<typeof comments>((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedComments = comments.slice(startIndex, endIndex);
      resolve(paginatedComments);
    }, 500);
  });
};

const overview = {
  summary:
    "Bài này tập trung luyện Part 5 – Incomplete Sentences. Mục tiêu là nắm chắc các điểm ngữ pháp trọng tâm và chiến lược làm nhanh, tránh bẫy thường gặp.",
  mainSections: [
    "Từ vựng: collocations (make a decision, take responsibility), từ loại dễ nhầm (adv/adj, noun/verb).",
    "Cấu trúc: thì động từ, mệnh đề quan hệ, câu điều kiện, so sánh hơn/so sánh nhất.",
    "Kỹ năng: nhận diện loại từ cần điền, áp dụng mẹo loại trừ nhanh.",
  ],
  focus: ["Part 5 – Incomplete Sentences"],
  tips: [
    "Đọc **trước và sau chỗ trống** để xác định từ loại phù hợp.",
    "Ưu tiên xét **thì động từ** và sự hòa hợp chủ ngữ – động từ.",
    "Chú ý **tín hiệu ngữ pháp**: liên từ (although, because), giới từ (in, on, at).",
    "Dùng **mẹo loại trừ** khi không chắc chắn: loại bỏ đáp án sai ngữ pháp rõ ràng.",
  ],
};

/* ---------------------- Helpers ---------------------- */
function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lesson-notes-tabpanel-${index}`}
      aria-labelledby={`lesson-notes-tab-${index}`}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `lesson-notes-tab-${index}`,
    "aria-controls": `lesson-notes-tabpanel-${index}`,
  };
}

/* ---------------------- Main Component ---------------------- */
const COMMENTS_PER_PAGE = 10; // Load 10 comments initially, then 10 more on scroll

export default function LessonNotes({ lessonData, week, day_id }: { lessonData?: any, week: string, day_id: string }) {
  const [tabIndex, setTabIndex] = React.useState(0);
  // keep comments in state so new feedback can be appended
  const [commentsState, setCommentsState] = React.useState(comments);
  const [feedbackSent, setFeedbackSent] = React.useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false);
  const [modalRating, setModalRating] = React.useState<number | null>(0);
  const [modalText, setModalText] = React.useState("");
  const [modalSending, setModalSending] = React.useState(false);
  // Infinite scroll state
  const [displayedComments, setDisplayedComments] = React.useState(
    commentsState.slice(0, COMMENTS_PER_PAGE)
  );
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Calculate displayed comments for current page
  React.useEffect(() => {
    fetchComments(currentPage, COMMENTS_PER_PAGE).then((paginatedComments) => {
      setDisplayedComments(paginatedComments);
    });
  }, [currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(commentsState.length / COMMENTS_PER_PAGE);

  const avg =
    commentsState.reduce((s, c) => s + (c.rating || 0), 0) / Math.max(1, commentsState.length);

  const filteredSections = React.useMemo(() => {
    if (!lessonData) return [];
    return (lessonData.sections_id || []).filter((s: any) => {
      if (s.type === "media") return false;
      if (s.type === "error") {
        const err = s.error || {};
        const meaningful = Object.keys(err).filter(
          (k) =>
            k !== "_id" &&
            err[k] !== null &&
            err[k] !== undefined &&
            err[k] !== ""
        );
        return meaningful.length > 0;
      }
      return true;
    });
  }, [lessonData]);

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        // reduce base font size so notes are smaller and less dominant
        fontSize: '0.88rem',
        '& .MuiTypography-root': {
          fontSize: '0.88rem',
        },
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          aria-label="lesson tabs"
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              // smaller tab labels per UX request
              fontSize: "0.8rem",
              minHeight: 40,
            },
          }}
        >
          <Tab
            icon={<SummaryIcon fontSize="small" />}
            iconPosition="start"
            label="Insight"
            {...a11yProps(0)}
          />
          <Tab
            icon={<EditIcon fontSize="small" />}
            iconPosition="start"
            label="Notes"
            {...a11yProps(1)}
          />
          <Tab
            icon={<ChatIcon fontSize="small" />}
            iconPosition="start"
            label={`Feedback (${commentsState.length})`}
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {/* TAB 0: INSIGHT (TỔNG QUAN) */}
        <TabPanel value={tabIndex} index={0}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Khái quát nội dung bài học
            </Typography>

            {lessonData ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thông tin phiên học
                </Typography>
                {filteredSections.map((s: any, i: number) => (
                  <Card
                    key={i}
                    variant="outlined"
                    sx={{ borderRadius: 2, boxShadow: 1 }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {s.title || s.type}
                          </Typography>
                          <Chip
                            label={s.type}
                            size="small"
                            color={
                              s.type === "text"
                                ? "default"
                                : s.type === "example"
                                  ? "primary"
                                  : s.type === "error"
                                    ? "error"
                                    : "secondary"
                            }
                            variant="outlined"
                          />
                        </Stack>

                        {/* TEXT */}
                        {s.type === "text" && s.content && (
                          <Typography
                            variant="body1"
                            sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
                          >
                            {s.content}
                          </Typography>
                        )}

                        {/* EXAMPLE */}
                        {s.type === "example" && s.example && (
                          <Box
                            sx={{
                              bgcolor: "grey.50",
                              p: 2,
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor: "primary.main",
                            }}
                          >
                            <Stack spacing={1.5}>
                              {s.example.en && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    English
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {s.example.en}
                                  </Typography>
                                </Box>
                              )}
                              {s.example.vi && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Tiếng Việt
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {s.example.vi}
                                  </Typography>
                                </Box>
                              )}
                              {s.example.note && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Ghi chú
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5, fontStyle: "italic" }}
                                  >
                                    {s.example.note}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        )}

                        {/* ERROR */}
                        {s.type === "error" && s.error && (
                          <Box
                            sx={{
                              bgcolor: "error.50",
                              p: 2,
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor: "error.main",
                            }}
                          >
                            <Stack spacing={1.5}>
                              {s.error.wrong && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                    sx={{
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ❌ Sai
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {s.error.wrong}
                                  </Typography>
                                </Box>
                              )}
                              {s.error.correct && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="success.main"
                                    sx={{
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ✅ Đúng
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {s.error.correct}
                                  </Typography>
                                </Box>
                              )}
                              {s.error.explanation && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      textTransform: "uppercase",
                                      fontWeight: 600,
                                    }}
                                  >
                                    💡 Giải thích
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {s.error.explanation}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        )}

                        {/* TABLE */}
                        {s.type === "table" &&
                          s.tableData &&
                          Array.isArray(s.tableData) &&
                          s.tableData.length > 0 && (
                            <Paper
                              variant="outlined"
                              sx={{ overflow: "hidden" }}
                            >
                              <Table size="small">
                                <TableBody>
                                  {s.tableData.map(
                                    (row: any[], rowIdx: number) => (
                                      <TableRow key={rowIdx} hover>
                                        {Array.isArray(row) &&
                                          row.map(
                                            (cell: any, cellIdx: number) => (
                                              <TableCell key={cellIdx}>
                                                {cell?.toString() || ""}
                                              </TableCell>
                                            )
                                          )}
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </Paper>
                          )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <>
                {/* Tóm tắt */}
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tóm tắt
                  </Typography>
                  <Typography variant="body1">{overview.summary}</Typography>
                </Stack>

                {/* Trọng tâm */}
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trọng tâm
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {overview.focus.map((f) => (
                      <Chip
                        key={f}
                        label={f}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Stack>

                <Grid container spacing={2}>
                  {/* Mục chính */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Các mục chính
                    </Typography>
                    <List dense disablePadding>
                      {overview.mainSections.map((s, i) => (
                        <ListItem key={i} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2">• {s}</Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  {/* Mẹo/Chiến lược */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Mẹo & Chiến lược
                    </Typography>
                    <List dense disablePadding>
                      {overview.tips.map((t, i) => (
                        <ListItem key={i} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                dangerouslySetInnerHTML={{ __html: t }}
                              />
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>

                {/* Tags minh họa */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label="vocabulary" variant="outlined" />
                  <Chip size="small" label="paraphrase" variant="outlined" />
                  <Chip size="small" label="distractor" variant="outlined" />
                </Stack>
              </>
            )}
          </Stack>
        </TabPanel>

        {/* TAB 1: GHI CHÚ (NOTES) */}
        <TabPanel value={tabIndex} index={1}>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              p: 2,
            }}
          >
            <LessonTakeNotes lesson={lessonData} week={week} day_id={day_id} />
          </Box>
        </TabPanel>

        {/* TAB 2: THẢO LUẬN (FEEDBACK) */}
        <TabPanel value={tabIndex} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1, flexShrink: 0 }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Đánh giá trung bình
              </Typography>
              <Rating value={avg} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {avg.toFixed(1)}/5
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="outlined"
                onClick={() => setFeedbackModalOpen(true)}
                disabled={feedbackSent}
              >
                Feedback
              </Button>
            </Stack>

            <Divider sx={{ mb: 1.5, flexShrink: 0 }} />

            {/* Feedback modal (rating + feedback) */}
            <Dialog
              open={feedbackModalOpen}
              onClose={() => setFeedbackModalOpen(false)}
              fullWidth
              maxWidth="sm"
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  p: 1,
                },
              }}
            >
              <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <FeedbackIcon sx={{ color: "#1976d2" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Gửi Feedback
                  </Typography>
                </Stack>
              </DialogTitle>

              <DialogContent sx={{ mt: 1 }}>
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Đánh giá của bạn
                    </Typography>
                    <Rating
                      value={modalRating}
                      onChange={(_, val) => setModalRating(val)}
                      size="large"
                    />
                  </Stack>

                  <TextField
                    label="Nội dung góp ý"
                    placeholder="Hãy cho chúng tôi biết trải nghiệm của bạn..."
                    multiline
                    minRows={3}
                    fullWidth
                    value={modalText}
                    onChange={(e) => setModalText(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setFeedbackModalOpen(false)}
                  sx={{ color: "text.secondary" }}
                >
                  Hủy
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  disabled={
                    modalSending ||
                    feedbackSent ||
                    (!modalText.trim() && (!modalRating || modalRating <= 0))
                  }
                  onClick={async () => {
                    if (feedbackSent) return;

                    if (!modalText.trim() && (!modalRating || modalRating <= 0)) return;

                    setModalSending(true);

                    try {
                      const mockSend = (_: any) =>
                        new Promise((resolve) =>
                          setTimeout(
                            () => resolve({ ok: true, id: `fb-${Date.now()}` }),
                            700
                          )
                        );

                      const res: any = await mockSend({
                        content: modalText,
                        rating: modalRating,
                      });

                      const newComment = {
                        id: res.id || `fb-${Date.now()}`,
                        user: { name: "Bạn", avatar: "" },
                        rating: modalRating || 0,
                        content: modalText,
                        time: "vừa xong",
                      };

                      setCommentsState((prev) => [newComment, ...prev]);
                      setDisplayedComments((prev) => [newComment, ...prev]);
                      setFeedbackSent(true);
                      setFeedbackModalOpen(false);
                    } catch (err) {
                      console.error("Send feedback failed", err);
                    } finally {
                      setModalSending(false);
                    }
                  }}
                  sx={{ px: 3, borderRadius: 2 }}
                >
                  {modalSending ? "Đang gửi..." : "Gửi"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Comments list with scroll */}
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <List disablePadding>
                {displayedComments.map((cmt, idx) => (
                  <React.Fragment key={cmt.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar alt={cmt.user.name} src={cmt.user.avatar} />
                      </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <div className="flex items-center gap-2">
                            <Typography
                              component="span"
                              variant="subtitle2"
                              fontWeight="bold"
                            >
                              {cmt.user.name}
                            </Typography>

                            <Rating
                              value={cmt.rating}
                              readOnly
                              size="small"
                              sx={{ my: 0.5 }}
                            />
                          </div>
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "12px !important",
                              fontStyle: "italic",
                              color: "text.secondary"
                            }}
                          >
                            {cmt.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          {cmt.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < displayedComments.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
              </List>

              {/* Pagination buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Box>
    </Paper>
  );
}