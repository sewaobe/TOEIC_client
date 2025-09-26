import * as React from "react";
import {
    Card,
    CardContent,
    Stack,
    Tabs,
    Tab,
    Box,
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditNote";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";
import SummaryIcon from "@mui/icons-material/Summarize";
import Editor from "../common/Editor";
import LessonSummary from "./LessonSummary";

/* ----------------------- Mock data ----------------------- */
const comments = [
    {
        id: "c1",
        user: { name: "Minh Anh", avatar: "https://i.pravatar.cc/100?img=1" },
        rating: 4.5,
        content:
            "Phần hội thoại Part 3 khá rõ, có nhiều paraphrase. Mẹo note keyword ở 5–10s đầu giúp bắt kịp mạch câu hỏi.",
        time: "2 giờ trước",
    },
    {
        id: "c2",
        user: { name: "Quốc Huy", avatar: "https://i.pravatar.cc/100?img=12" },
        rating: 4,
        content:
            "Từ vựng về lịch trình (reschedule, postpone, itinerary) xuất hiện dày. Nên làm flashcards.",
        time: "hôm qua",
    },
    {
        id: "c3",
        user: { name: "Lan Phương", avatar: "https://i.pravatar.cc/100?img=5" },
        rating: 5,
        content:
            "Part 7 đoạn đơn dễ nhầm distractor dạng số liệu. Hãy gạch chân units trước khi đọc đáp án.",
        time: "2 ngày trước",
    },
];

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
        >
            {value === index && <Box sx={{ pt: 1.5 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `lesson-notes-tab-${index}`,
        "aria-controls": `lesson-notes-tabpanel-${index}`,
    };
}

/* ========================== Component ========================== */
export default function LessonNotes() {
    const [tab, setTab] = React.useState(0);
    const avg =
        comments.reduce((s, c) => s + c.rating, 0) / Math.max(1, comments.length);

    return (
        <Card variant="outlined" className="rounded-3xl">
            <CardContent className="py-4 sm:py-6">
                <Stack spacing={2}>
                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons={false}              // ⛔ ẩn 2 icon trái/phải
                        allowScrollButtonsMobile={false}   // ⛔ không bật trên mobile
                        aria-label="Tabs ghi chú / nhận xét / tổng quát"
                        className="
                                border border-black/5 bg-white/70
                                px-2 py-1 overflow-x-auto
                                backdrop-blur
                            "
                        sx={{
                            minHeight: 36,                                   // thấp tổng thể
                            '& .MuiTabs-indicator': { height: 2, },
                        }}
                    >
                        <Tab
                            icon={<EditIcon fontSize="small" />}
                            iconPosition="start"
                            label="Notes"
                            disableRipple
                            {...a11yProps(0)}
                            className="
                                normal-case !text-[13px] 
                                px-3 py-1.5 rounded-lg
                                transition-colors
                                hover:text-blue-600 hover:bg-blue-50
                                [&.Mui-selected]:text-blue-600
                                [&.Mui-selected]:bg-blue-50
                                "
                            sx={{ minHeight: 36 }}
                        />
                        <Tab
                            icon={<ChatIcon fontSize="small" />}
                            iconPosition="start"
                            label={`Feedback (${comments.length})`}
                            disableRipple
                            {...a11yProps(1)}
                            className="
                                normal-case !text-[13px] 
                                px-3 py-1.5 rounded-lg
                                transition-colors
                                hover:text-blue-600 hover:bg-blue-50
                                [&.Mui-selected]:text-blue-600
                                [&.Mui-selected]:bg-blue-50
                                "
                            sx={{ minHeight: 36 }}
                        />
                        <Tab
                            icon={<SummaryIcon fontSize="small" />}
                            iconPosition="start"
                            label="Insight"
                            disableRipple
                            {...a11yProps(2)}
                            className="
                                normal-case !text-[13px] 
                                px-3 py-1.5 rounded-lg
                                transition-colors
                                hover:text-blue-600 hover:bg-blue-50
                                [&.Mui-selected]:text-blue-600
                                [&.Mui-selected]:bg-blue-50
                                "
                            sx={{ minHeight: 36 }}
                        />
                    </Tabs>

                    {/* --- Tab 1: Ghi chú --- */}
                    <TabPanel value={tab} index={0}>
                        <LessonSummary />
                    </TabPanel>

                    {/* --- Tab 2: Nhận xét --- */}
                    <TabPanel value={tab} index={1}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Đánh giá trung bình
                            </Typography>
                            <Rating value={avg} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                                {avg.toFixed(1)}/5
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 1.5 }} />

                        <List disablePadding>
                            {comments.map((c, idx) => (
                                <React.Fragment key={c.id}>
                                    <ListItem alignItems="flex-start" disableGutters>
                                        <ListItemAvatar>
                                            <Avatar src={c.user.avatar} alt={c.user.name} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                >
                                                    <Typography variant="subtitle2">{c.user.name}</Typography>
                                                    <Rating
                                                        value={c.rating}
                                                        precision={0.5}
                                                        size="small"
                                                        readOnly
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ ml: 0.5 }}
                                                    >
                                                        {c.time}
                                                    </Typography>
                                                </Stack>
                                            }
                                            secondary={
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {c.content}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {idx < comments.length - 1 && (
                                        <Divider variant="inset" component="li" />
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                    </TabPanel>

                    {/* --- Tab 3: Tổng quát --- */}
                    <TabPanel value={tab} index={2}>
                        <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Khái quát nội dung bài học
                            </Typography>

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
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {overview.focus.map((f) => (
                                        <Chip key={f} label={f} color="primary" variant="outlined" />
                                    ))}
                                </Stack>
                            </Stack>

                            <Grid container spacing={2}>
                                {/* Mục chính */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Các mục chính
                                    </Typography>
                                    <List dense disablePadding>
                                        {overview.mainSections.map((s, i) => (
                                            <ListItem key={i} sx={{ py: 0.5 }}>
                                                <ListItemText
                                                    primary={<Typography variant="body2">• {s}</Typography>}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>

                                {/* Mẹo/Chiến lược */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        Mẹo & Chiến lược
                                    </Typography>
                                    <List dense disablePadding>
                                        {overview.tips.map((t, i) => (
                                            <ListItem key={i} sx={{ py: 0.5 }}>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" dangerouslySetInnerHTML={{ __html: t }} />
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>

                            {/* Tags minh họa / có thể lấy từ lesson */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip size="small" label="vocabulary" variant="outlined" />
                                <Chip size="small" label="paraphrase" variant="outlined" />
                                <Chip size="small" label="distractor" variant="outlined" />
                            </Stack>
                        </Stack>
                    </TabPanel>
                </Stack>
            </CardContent>
        </Card>
    );
}
