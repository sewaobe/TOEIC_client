import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    InputAdornment,
    LinearProgress,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
    LearningPathSkillMapResponse,
    SkillMapAbilityStatus,
    SkillMapHistoryItem,
    SkillMapHistoryResponse,
    SkillMapPartsResponse,
    SkillMapSkill,
    SkillMapSkillsResponse,
    SkillMapTab,
} from "../../types/user_skill";
import learningPathV2Service from "../../services/learning_path_v2.service";

type LearningPathSkillMapModalProps = {
    open: boolean;
    learningPathId: string | null;
    onClose: () => void;
};

type SkillFilterStatus =
    | "all"
    | "weak"
    | "focus"
    | "listening"
    | "reading"
    | "basic"
    | "core"
    | "advanced";

const skillMapColors = {
    primary: "#3F46F6",
    primarySoft: "#EEF2FF",
    primaryBorder: "#C7D2FE",

    navy: "#0F172A",
    text: "#334155",
    muted: "#64748B",
    border: "rgba(148,163,184,0.22)",
    surface: "#FFFFFF",
    softSurface: "#F8FAFC",

    weak: "#EA580C",
    weakSoft: "rgba(234,88,12,0.10)",
    weakBorder: "rgba(234,88,12,0.22)",

    medium: "#D97706",
    mediumSoft: "rgba(217,119,6,0.10)",
    mediumBorder: "rgba(217,119,6,0.22)",

    strong: "#059669",
    strongSoft: "rgba(5,150,105,0.10)",
    strongBorder: "rgba(5,150,105,0.22)",
};

const skillMapTextSx = {
    title: {
        fontSize: 20,
        fontWeight: 800,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
    },
    label: {
        fontSize: 14,
        fontWeight: 700,
    },
    caption: {
        fontSize: 12,
        fontWeight: 600,
    },
    helper: {
        fontSize: 12,
        fontWeight: 500,
    },
};

const skillMapLayout = {
    contentPadding: { xs: 1.75, sm: 2.2, md: 2.7, lg: 3, xl: 3.2 },
    sectionGap: { xs: 1.4, sm: 1.7, md: 2, lg: 2.1, xl: 2.2 },
    partIconSize: { xs: 34, sm: 36, md: 38, lg: 40, xl: 42 },
    chipHeight: { xs: 26, sm: 27, md: 28, lg: 28, xl: 29 },
    focusChipCompactColumnWidth: 110,
    focusChipColumnWidth: 118,
    modalHeight: {
        xs: "calc(100% - 20px)",
        sm: "min(760px, calc(100% - 56px))",
        md: "min(820px, calc(100% - 56px))",
        lg: "min(840px, calc(100% - 56px))",
        xl: "min(860px, calc(100% - 56px))",
    },
    contentMinHeight: { xs: 420, sm: 480, md: 540, lg: 560, xl: 580 },
};

const tabs: Array<{ value: SkillMapTab; label: string }> = [
    { value: "parts", label: "Theo Part" },
    { value: "skills", label: "Theo kỹ năng" },
    { value: "history", label: "Lịch sử" },
];

const getApiPayload = <T,>(response: any): T => {
    return (response?.data?.data ?? response?.data) as T;
};

const partIcons: Record<number, React.ReactNode> = {
    1: <ImageOutlinedIcon fontSize="small" />,
    2: <HeadphonesOutlinedIcon fontSize="small" />,
    3: <ChatBubbleOutlineIcon fontSize="small" />,
    4: <FormatListBulletedIcon fontSize="small" />,
    5: <ArticleOutlinedIcon fontSize="small" />,
    6: <AutoStoriesOutlinedIcon fontSize="small" />,
    7: <MenuBookOutlinedIcon fontSize="small" />,
};

const getPartTheme = (partType: number) => {
    const isListening = partType >= 1 && partType <= 4;

    return {
        icon: partIcons[partType] ?? <MapOutlinedIcon fontSize="small" />,
        domain: isListening ? "Listening" : "Reading",
        color: skillMapColors.primary,
        bg: skillMapColors.primarySoft,
        border: skillMapColors.primaryBorder,
    };
};

const getStatusLabel = (status: SkillMapAbilityStatus) => {
    if (status === "weak") return "Yếu";
    if (status === "medium") return "Trung bình";
    return "Tốt";
};

const getStatusTheme = (status: SkillMapAbilityStatus) => {
    if (status === "weak") {
        return {
            color: skillMapColors.weak,
            bg: skillMapColors.weakSoft,
            border: skillMapColors.weakBorder,
        };
    }

    if (status === "medium") {
        return {
            color: skillMapColors.medium,
            bg: skillMapColors.mediumSoft,
            border: skillMapColors.mediumBorder,
        };
    }

    return {
        color: skillMapColors.strong,
        bg: skillMapColors.strongSoft,
        border: skillMapColors.strongBorder,
    };
};

const getTrendLabel = (trend?: string, delta?: number) => {
    if (typeof delta === "number" && Number.isFinite(delta)) {
        if (delta > 0) return `+${delta}% so với lần trước`;
        if (delta < 0) return `${delta}% so với lần trước`;
        return "Ổn định";
    }

    if (trend === "improving") return "Đang cải thiện";
    if (trend === "declining") return "Đang giảm";
    return "Ổn định";
};

const getTrendColor = (trend?: string, delta?: number) => {
    if (typeof delta === "number") {
        if (delta > 0) return skillMapColors.strong;
        if (delta < 0) return "#DC2626";
    }

    if (trend === "improving") return skillMapColors.strong;
    if (trend === "declining") return "#DC2626";
    return skillMapColors.muted;
};

const getSkillGroupLabel = (value?: string) => {
    if (value === "basic") return "Cơ bản";
    if (value === "core") return "Cốt lõi";
    if (value === "advanced") return "Nâng cao";
    return "Kỹ năng";
};

const formatDate = (value?: string | Date | null) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const getEvidenceLabel = (itemCount?: number) => {
    if (typeof itemCount !== "number" || !Number.isFinite(itemCount) || itemCount <= 0) {
        return "-- câu";
    }

    return `${itemCount} câu`;
};

const getEvidenceTooltip = ({
    item_count,
    correct_count,
    ability_percent,
}: {
    item_count?: number;
    correct_count?: number;
    ability_percent: number;
}) => {
    if (typeof item_count !== "number" || !Number.isFinite(item_count) || item_count <= 0) {
        return "Chưa có dữ liệu số câu từ lịch sử kiểm tra.";
    }

    const correctLabel =
        typeof correct_count === "number" && Number.isFinite(correct_count)
            ? `${correct_count}/${item_count} câu đúng`
            : `${item_count} câu đã làm`;

    return `${correctLabel}. Năng lực hiện tại: ${ability_percent}%.`;
};

function ModalHeader({
    activeTab,
    onChangeTab,
    onClose,
}: {
    activeTab: SkillMapTab;
    onChangeTab: (tab: SkillMapTab) => void;
    onClose: () => void;
}) {
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.6} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            width: { xs: 48, md: 54 },
                            height: { xs: 48, md: 54 },
                            borderRadius: 2.5,
                            display: "grid",
                            placeItems: "center",
                            color: skillMapColors.primary,
                            bgcolor: "#FFFFFF",
                            border: `1px solid ${skillMapColors.border}`,
                            boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
                            flex: "0 0 auto",
                        }}
                    >
                        <MapOutlinedIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ ...skillMapTextSx.title, color: skillMapColors.navy }}>
                            Bản đồ năng lực
                        </Typography>
                        <Typography
                            sx={{
                                ...skillMapTextSx.helper,
                                color: skillMapColors.muted,
                                mt: 0.35,
                            }}
                        >
                            Bản đồ năng lực sẽ được cập nhật sau mỗi bài Entry Test, Mini Test và Full Test.
                        </Typography>
                    </Box>
                </Stack>

                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Stack>

            <Stack
                direction="row"
                spacing={{ xs: 1.2, sm: 1.6, md: 2 }}
                sx={{
                    mt: { xs: 1.8, md: 2.2 },
                    borderBottom: `1px solid ${skillMapColors.border}`,
                }}
            >
                {tabs.map((tab) => {
                    const active = activeTab === tab.value;

                    return (
                        <Button
                            key={tab.value}
                            onClick={() => onChangeTab(tab.value)}
                            disableRipple
                            sx={{
                                minWidth: 0,
                                px: { xs: 1.2, sm: 1.5, md: 1.8 },
                                py: 1,
                                borderRadius: "12px 12px 0 0",
                                textTransform: "none",
                                color: active ? skillMapColors.primary : skillMapColors.text,
                                bgcolor: active ? "#FFFFFF" : "transparent",
                                border: active ? `1px solid ${skillMapColors.border}` : "1px solid transparent",
                                borderBottom: active ? `3px solid ${skillMapColors.primary}` : "3px solid transparent",
                                transform: active ? "translateY(1px)" : "none",
                                ...skillMapTextSx.label,
                                "&:hover": {
                                    bgcolor: active ? "#FFFFFF" : skillMapColors.softSurface,
                                },
                            }}
                        >
                            {tab.label}
                        </Button>
                    );
                })}
            </Stack>
        </Box>
    );
}

function SummaryCard({
    icon,
    title,
    main,
    helper,
    tone = "neutral",
}: {
    icon: React.ReactNode;
    title: string;
    main: string;
    helper?: string;
    tone?: "neutral" | "good" | "warning";
}) {
    const toneConfig =
        tone === "good"
            ? {
                bg: "rgba(5,150,105,0.06)",
                border: "rgba(5,150,105,0.16)",
                color: skillMapColors.strong,
            }
            : tone === "warning"
                ? {
                    bg: "rgba(217,119,6,0.07)",
                    border: "rgba(217,119,6,0.18)",
                    color: skillMapColors.medium,
                }
                : {
                    bg: skillMapColors.softSurface,
                    border: skillMapColors.border,
                    color: skillMapColors.primary,
                };

    return (
        <Box
            sx={{
                p: { xs: 1.3, sm: 1.55, md: 1.75 },
                borderRadius: 2.5,
                bgcolor: toneConfig.bg,
                border: `1px solid ${toneConfig.border}`,
                minHeight: { xs: 92, md: 104 },
            }}
        >
            <Stack direction="row" spacing={1.4} alignItems="center">
                <Box
                    sx={{
                        width: { xs: 42, md: 48 },
                        height: { xs: 42, md: 48 },
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        color: toneConfig.color,
                        bgcolor: "#FFFFFF",
                        border: `1px solid ${toneConfig.border}`,
                        flex: "0 0 auto",
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                        {title}
                    </Typography>
                    <Typography
                        sx={{
                            mt: 0.2,
                            ...skillMapTextSx.title,
                            color: skillMapColors.navy,
                            lineHeight: 1.15,
                        }}
                    >
                        {main}
                    </Typography>
                    {helper && (
                        <Typography sx={{ ...skillMapTextSx.caption, color: toneConfig.color, mt: 0.3 }}>
                            {helper}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}

function PartIdentity({
    partType,
    muted = false,
}: {
    partType: number;
    muted?: boolean;
}) {
    const theme = getPartTheme(partType);
    const summaryColors = {
        color: theme.color,
        text: muted ? skillMapColors.muted : skillMapColors.navy,
    };

    const inactivePartThemeColors = {
        border: skillMapColors.border,
    };

    const hasInCycle = true;

    return (
        <Stack direction="row" spacing={1.05} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
                sx={{
                    width: skillMapLayout.partIconSize,
                    height: skillMapLayout.partIconSize,
                    borderRadius: 1.5,
                    display: "grid",
                    placeItems: "center",
                    color: summaryColors.color,
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${hasInCycle ? `${summaryColors.color}22` : inactivePartThemeColors.border
                        }`,
                }}
            >
                {theme.icon}
            </Box>

            <Typography
                sx={{
                    ...skillMapTextSx.label,
                    color: summaryColors.text,
                    whiteSpace: "nowrap",
                }}
            >
                Part {partType}
            </Typography>
        </Stack>
    );
}

function StatusChip({ status }: { status: SkillMapAbilityStatus }) {
    const theme = getStatusTheme(status);

    return (
        <Chip
            label={getStatusLabel(status)}
            size="small"
            sx={{
                height: skillMapLayout.chipHeight,
                borderRadius: 999,
                color: theme.color,
                bgcolor: theme.bg,
                border: `1px solid ${theme.border}`,
                ...skillMapTextSx.caption,
                "& .MuiChip-label": { px: 0.9 },
            }}
        />
    );
}

function EvidenceCell({
    item_count,
    correct_count,
    ability_percent,
}: {
    item_count?: number;
    correct_count?: number;
    ability_percent: number;
}) {
    return (
        <Tooltip
            title={getEvidenceTooltip({
                item_count,
                correct_count,
                ability_percent,
            })}
            arrow
        >
            <Stack
                direction="row"
                spacing={0.55}
                alignItems="center"
                justifyContent="center"
                sx={{ minWidth: 0, whiteSpace: "nowrap" }}
            >
                <Typography sx={{ ...skillMapTextSx.label, color: skillMapColors.navy }}>
                    {getEvidenceLabel(item_count)}
                </Typography>
                <InfoOutlinedIcon sx={{ fontSize: 15, color: skillMapColors.muted }} />
            </Stack>
        </Tooltip>
    );
}

function AbilityBar({ percent, status }: { percent: number; status: SkillMapAbilityStatus }) {
    const theme = getStatusTheme(status);

    return (
        <Box sx={{ width: "100%", minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.45 }}>
                <Typography sx={{ ...skillMapTextSx.caption, color: skillMapColors.muted }}>
                    Năng lực
                </Typography>
                <Typography sx={{ ...skillMapTextSx.caption, color: theme.color }}>
                    {percent}%
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, percent))}
                sx={{
                    height: 7,
                    borderRadius: 999,
                    bgcolor: "rgba(148,163,184,0.18)",
                    "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: theme.color,
                    },
                }}
            />
        </Box>
    );
}

function TrendText({
    trend,
    delta,
}: {
    trend?: string;
    delta?: number;
}) {
    const color = getTrendColor(trend, delta);
    const isDown = trend === "declining" || (typeof delta === "number" && delta < 0);

    return (
        <Stack
            direction="row"
            spacing={0.35}
            alignItems="center"
            justifyContent="center"
            sx={{
                minWidth: 0,
                whiteSpace: "nowrap",
            }}
        >
            {isDown ? (
                <TrendingDownOutlinedIcon sx={{ fontSize: 16, color }} />
            ) : (
                <TrendingUpOutlinedIcon sx={{ fontSize: 16, color }} />
            )}
            <Typography sx={{ ...skillMapTextSx.caption, color }}>
                {getTrendLabel(trend, delta)}
            </Typography>
        </Stack>
    );
}

function PartsTab({ data }: { data: SkillMapPartsResponse }) {
    const parts = data.parts ?? [];
    const weakestPart = data.summary.weakest_parts?.[0];
    const improvingPart = data.summary.improving_parts?.[0];
    const focusParts = data.summary.focus_part_types ?? [];

    return (
        <Stack spacing={skillMapLayout.sectionGap}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: { xs: 1, md: 1.4 },
                }}
            >
                <SummaryCard
                    icon={<TrendingDownOutlinedIcon />}
                    title="Part yếu nhất"
                    main={weakestPart ? `Part ${weakestPart}` : "--"}
                    helper={
                        weakestPart
                            ? `${parts.find((p) => p.part_type === weakestPart)?.ability_percent ?? 0}% · Yếu`
                            : undefined
                    }
                    tone="warning"
                />
                <SummaryCard
                    icon={<TrendingUpOutlinedIcon />}
                    title="Part tiến bộ"
                    main={improvingPart ? `Part ${improvingPart}` : "--"}
                    helper="So với lần trước"
                    tone="good"
                />
                <SummaryCard
                    icon={<FlagOutlinedIcon />}
                    title="Cần ưu tiên"
                    main={focusParts.length ? focusParts.map((p) => `Part ${p}`).join(", ") : "--"}
                    helper={`${focusParts.length} part cần tập trung`}
                    tone="warning"
                />
            </Box>

            <Stack spacing={0.85}>
                {parts.map((part) => (
                    <Box
                        key={part.part_type}
                        sx={{
                            p: { xs: 1.1, sm: 1.25, md: 1.45 },
                            borderRadius: 2.5,
                            border: `1px solid ${skillMapColors.border}`,
                            bgcolor: "#FFFFFF",
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "140px 82px 72px 104px minmax(140px, 1fr) 96px 110px",
                                lg: `170px 100px 82px 112px minmax(200px, 1fr) 108px ${skillMapLayout.focusChipColumnWidth}px`,
                            },
                            alignItems: "center",
                            gap: { xs: 0.9, md: 1.25 },
                        }}
                    >
                        <PartIdentity partType={part.part_type} />

                        <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                            {part.skill_domain}
                        </Typography>

                        <EvidenceCell
                            item_count={part.item_count}
                            correct_count={part.correct_count}
                            ability_percent={part.ability_percent}
                        />

                        <StatusChip status={part.status} />

                        <AbilityBar percent={part.ability_percent} status={part.status} />

                        <TrendText trend={part.trend} delta={part.trend_delta_percent} />

                        {part.is_focus_part ? (
                            <Chip
                                label="Thuộc cycle này"
                                size="small"
                                sx={{
                                    height: skillMapLayout.chipHeight,
                                    borderRadius: 999,
                                    color: skillMapColors.medium,
                                    bgcolor: skillMapColors.mediumSoft,
                                    border: `1px solid ${skillMapColors.mediumBorder}`,
                                    width: {
                                        md: skillMapLayout.focusChipCompactColumnWidth,
                                        lg: skillMapLayout.focusChipColumnWidth,
                                    },
                                    ...skillMapTextSx.caption,
                                    "& .MuiChip-label": { px: 0.9 },
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: {
                                        md: skillMapLayout.focusChipCompactColumnWidth,
                                        lg: skillMapLayout.focusChipColumnWidth,
                                    },
                                }}
                            />
                        )}
                    </Box>
                ))}
            </Stack>

            <FooterNote text="Năng lực hiện tại được tổng hợp từ các bài kiểm tra gần nhất." />
        </Stack>
    );
}

function SkillFilterChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            onClick={onClick}
            sx={{
                height: { xs: 32, md: 34 },
                px: 1.5,
                borderRadius: 999,
                textTransform: "none",
                color: active ? "#FFFFFF" : skillMapColors.text,
                bgcolor: active ? skillMapColors.primary : "#FFFFFF",
                border: `1px solid ${active ? skillMapColors.primary : skillMapColors.border}`,
                ...skillMapTextSx.caption,
                "&:hover": {
                    bgcolor: active ? skillMapColors.primary : skillMapColors.softSurface,
                },
            }}
        >
            {label}
        </Button>
    );
}

const SkillRow = React.memo(function SkillRow({ skill }: { skill: SkillMapSkill }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(190px, 1fr) 96px 72px 104px minmax(140px, 1fr) 96px 110px",
                    lg: `minmax(260px, 1fr) 112px 82px 112px minmax(200px, 1fr) 108px ${skillMapLayout.focusChipColumnWidth}px`,
                },
                gap: { xs: 0.75, md: 1 },
                alignItems: "center",
                py: 0.9,
                px: { xs: 1.1, md: 1.35 },
                borderTop: `1px solid ${skillMapColors.border}`,
            }}
        >
            <Typography
                title={skill.label_vi || skill.skill_key}
                sx={{
                    ...skillMapTextSx.label,
                    color: skillMapColors.navy,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {skill.label_vi || skill.skill_key}
            </Typography>

            <Chip
                label={getSkillGroupLabel(skill.skill_group)}
                size="small"
                sx={{
                    height: skillMapLayout.chipHeight,
                    borderRadius: 999,
                    color:
                        skill.skill_group === "advanced"
                            ? skillMapColors.primary
                            : skill.skill_group === "core"
                                ? skillMapColors.strong
                                : skillMapColors.primary,
                    bgcolor:
                        skill.skill_group === "advanced"
                            ? skillMapColors.primarySoft
                            : skill.skill_group === "core"
                                ? skillMapColors.strongSoft
                                : skillMapColors.primarySoft,
                    border: `1px solid ${skillMapColors.border}`,
                    ...skillMapTextSx.caption,
                    "& .MuiChip-label": { px: 0.9 },
                }}
            />

            <EvidenceCell
                item_count={skill.item_count}
                correct_count={skill.correct_count}
                ability_percent={skill.ability_percent}
            />

            <StatusChip status={skill.status} />

            <AbilityBar percent={skill.ability_percent} status={skill.status} />

            <TrendText trend={skill.trend} delta={skill.trend_delta_percent} />

            {skill.is_focus_skill ? (
                <Chip
                    label="Thuộc cycle này"
                    size="small"
                    sx={{
                        height: skillMapLayout.chipHeight,
                        borderRadius: 999,
                        color: skillMapColors.medium,
                        bgcolor: skillMapColors.mediumSoft,
                        border: `1px solid ${skillMapColors.mediumBorder}`,
                        width: {
                            md: skillMapLayout.focusChipCompactColumnWidth,
                            lg: skillMapLayout.focusChipColumnWidth,
                        },
                        ...skillMapTextSx.caption,
                        "& .MuiChip-label": { px: 0.9 },
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: {
                            md: skillMapLayout.focusChipCompactColumnWidth,
                            lg: skillMapLayout.focusChipColumnWidth,
                        },
                    }}
                />
            )}
        </Box>
    );
});

function SkillsTab({
    data,
    skillFilter,
    filterValue,
    searchInput,
    appliedSearchText,
    isFiltering,
    onChangeFilter,
    onChangeSearchInput,
    onSubmitSearch,
}: {
    data: SkillMapSkillsResponse;
    skillFilter: SkillFilterStatus;
    filterValue: SkillFilterStatus;
    searchInput: string;
    appliedSearchText: string;
    isFiltering: boolean;
    onChangeFilter: (value: SkillFilterStatus) => void;
    onChangeSearchInput: (value: string) => void;
    onSubmitSearch: () => void;
}) {
    const skills = React.useMemo(() => {
        const normalizedSearch = appliedSearchText.trim().toLowerCase();

        return (data.skills ?? []).filter((skill) => {
            if (filterValue === "weak" && skill.status !== "weak") {
                return false;
            }

            if (filterValue === "focus" && !skill.is_focus_skill) {
                return false;
            }

            if (filterValue === "listening" && ![1, 2, 3, 4].includes(skill.part_type ?? 0)) {
                return false;
            }

            if (filterValue === "reading" && ![5, 6, 7].includes(skill.part_type ?? 0)) {
                return false;
            }

            if (
                (filterValue === "basic" || filterValue === "core" || filterValue === "advanced") &&
                skill.skill_group !== filterValue
            ) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            return (
                skill.skill_key.toLowerCase().includes(normalizedSearch) ||
                (skill.label_vi ?? "").toLowerCase().includes(normalizedSearch)
            );
        });
    }, [appliedSearchText, data.skills, filterValue]);

    const grouped = React.useMemo(
        () =>
            skills.reduce<Record<number, SkillMapSkill[]>>((acc, skill) => {
                const partType = skill.part_type ?? 0;
                if (!acc[partType]) acc[partType] = [];
                acc[partType].push(skill);
                return acc;
            }, {}),
        [skills]
    );

    const partTypes = React.useMemo(
        () =>
            Object.keys(grouped)
                .map(Number)
                .sort((a, b) => a - b),
        [grouped]
    );

    const weakest = React.useMemo(
        () =>
            [...skills]
                .filter((skill) => skill.status === "weak")
                .sort((a, b) => a.ability_percent - b.ability_percent)[0],
        [skills]
    );
    const focusSkillCount = React.useMemo(
        () => skills.filter((skill) => skill.is_focus_skill).length,
        [skills]
    );
    const improvingSkillCount = React.useMemo(
        () => skills.filter((skill) => skill.trend === "improving").length,
        [skills]
    );

    return (
        <Stack spacing={skillMapLayout.sectionGap}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
            >
                <TextField
                    value={searchInput}
                    onChange={(event) => onChangeSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            onSubmitSearch();
                        }
                    }}
                    placeholder="Tìm kỹ năng..."
                    size="small"
                    sx={{
                        width: { xs: "100%", md: 280 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "#FFFFFF",
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlinedIcon sx={{ color: skillMapColors.muted }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <SkillFilterChip
                        label="Tất cả"
                        active={skillFilter === "all"}
                        onClick={() => onChangeFilter("all")}
                    />
                    <SkillFilterChip
                        label="Yếu"
                        active={skillFilter === "weak"}
                        onClick={() => onChangeFilter("weak")}
                    />
                    <SkillFilterChip
                        label="Thuộc cycle"
                        active={skillFilter === "focus"}
                        onClick={() => onChangeFilter("focus")}
                    />
                    <SkillFilterChip
                        label="Listening"
                        active={skillFilter === "listening"}
                        onClick={() => onChangeFilter("listening")}
                    />
                    <SkillFilterChip
                        label="Reading"
                        active={skillFilter === "reading"}
                        onClick={() => onChangeFilter("reading")}
                    />
                    <SkillFilterChip
                        label="Cơ bản"
                        active={skillFilter === "basic"}
                        onClick={() => onChangeFilter("basic")}
                    />
                    <SkillFilterChip
                        label="Cốt lõi"
                        active={skillFilter === "core"}
                        onClick={() => onChangeFilter("core")}
                    />
                    <SkillFilterChip
                        label="Nâng cao"
                        active={skillFilter === "advanced"}
                        onClick={() => onChangeFilter("advanced")}
                    />
                </Stack>
            </Stack>

            <Box
                sx={{
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    opacity: isFiltering ? 1 : 0,
                    transition: "opacity 120ms ease",
                    pointerEvents: "none",
                }}
            >
                <LinearProgress
                    sx={{
                        width: "100%",
                        height: 4,
                        borderRadius: 999,
                        bgcolor: "rgba(148,163,184,0.16)",
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            bgcolor: skillMapColors.primary,
                        },
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: { xs: 1, md: 1.4 },
                }}
            >
                <SummaryCard
                    icon={<TrendingDownOutlinedIcon />}
                    title="Kỹ năng yếu nhất"
                    main={weakest ? `${weakest.label_vi} ${weakest.part_type ? `(Part ${weakest.part_type})` : ""}` : "--"}
                    helper={weakest ? `${weakest.ability_percent}% · Yếu` : undefined}
                    tone="warning"
                />
                <SummaryCard
                    icon={<FlagOutlinedIcon />}
                    title="Thuộc cycle này"
                    main={`${focusSkillCount} kỹ năng`}
                    helper="Tập trung cải thiện"
                    tone="warning"
                />
                <SummaryCard
                    icon={<TrendingUpOutlinedIcon />}
                    title="Tiến bộ tốt"
                    main={`${improvingSkillCount} kỹ năng`}
                    helper="Có xu hướng tăng"
                    tone="good"
                />
            </Box>

            <Stack spacing={1.2}>
                {partTypes.map((partType) => (
                    <Box
                        key={partType}
                        sx={{
                            borderRadius: 2.5,
                            border: `1px solid ${skillMapColors.border}`,
                            bgcolor: "#FFFFFF",
                            overflow: "hidden",
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ px: { xs: 1.25, md: 1.45 }, py: 1.15 }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <PartIdentity partType={partType} />
                                <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                                    {getPartTheme(partType).domain}
                                </Typography>
                            </Stack>

                            <Typography sx={{ ...skillMapTextSx.caption, color: skillMapColors.muted }}>
                                {grouped[partType].length} kỹ năng
                            </Typography>
                        </Stack>

                        {grouped[partType].map((skill) => (
                            <SkillRow key={`${partType}-${skill.skill_key}`} skill={skill} />
                        ))}
                    </Box>
                ))}
            </Stack>

            <FooterNote text="Nhãn “Thuộc cycle này” cho biết kỹ năng có xuất hiện trong các bài học được chọn cho cycle hiện tại." />
        </Stack>
    );
}

function ScoreTrendChart({ items }: { items: SkillMapHistoryResponse["score_trend"] }) {
    const validItems = (items ?? []).filter((item) => typeof item.score === "number");

    if (validItems.length === 0) {
        return (
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${skillMapColors.border}`,
                    bgcolor: "#FFFFFF",
                }}
            >
                <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                    Chưa có dữ liệu điểm tổng theo thời gian.
                </Typography>
            </Box>
        );
    }

    const width = 720;
    const height = 150;
    const paddingX = 42;
    const paddingY = 28;
    const scores = validItems.map((item) => Number(item.score));
    const minScore = Math.min(300, ...scores);
    const maxScore = Math.max(600, ...scores);
    const range = Math.max(1, maxScore - minScore);

    const points = validItems.map((item, index) => {
        const x =
            validItems.length === 1
                ? width / 2
                : paddingX + (index * (width - paddingX * 2)) / (validItems.length - 1);

        const y =
            height -
            paddingY -
            ((Number(item.score) - minScore) * (height - paddingY * 2)) / range;

        return { x, y, item };
    });

    const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

    return (
        <Box
            sx={{
                p: { xs: 1.4, md: 1.7 },
                borderRadius: 2.5,
                border: `1px solid ${skillMapColors.border}`,
                bgcolor: "#FFFFFF",
            }}
        >
            <Typography sx={{ ...skillMapTextSx.sectionTitle, color: skillMapColors.navy }}>
                Điểm tổng theo thời gian
            </Typography>

            <Box sx={{ mt: 1, width: "100%", overflow: "hidden" }}>
                <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="170">
                    {[300, 400, 500, 600].map((tick) => {
                        const y =
                            height -
                            paddingY -
                            ((tick - minScore) * (height - paddingY * 2)) / range;

                        return (
                            <g key={tick}>
                                <line
                                    x1={paddingX}
                                    x2={width - paddingX}
                                    y1={y}
                                    y2={y}
                                    stroke="rgba(148,163,184,0.18)"
                                    strokeDasharray="4 4"
                                />
                                <text x={10} y={y + 4} fontSize="11" fill="#64748B">
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    <polyline
                        points={polyline}
                        fill="none"
                        stroke={skillMapColors.primary}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {points.map((point) => (
                        <g key={point.item.history_id}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill={skillMapColors.primary}
                                stroke="#FFFFFF"
                                strokeWidth="3"
                            />
                            <text
                                x={point.x}
                                y={point.y - 13}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="700"
                                fill="#0F172A"
                            >
                                {point.item.score}
                            </text>
                            <text
                                x={point.x}
                                y={height - 6}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#64748B"
                            >
                                {point.item.label}
                            </text>
                        </g>
                    ))}
                </svg>
            </Box>

            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: skillMapColors.primary }} />
                <Typography sx={{ ...skillMapTextSx.caption, color: skillMapColors.muted }}>
                    Tăng trưởng ổn định qua các lần đánh giá
                </Typography>
            </Stack>
        </Box>
    );
}

const getHistoryIcon = (label: string) => {
    if (label.toLowerCase().includes("entry")) return <InsertDriveFileOutlinedIcon />;
    if (label.toLowerCase().includes("full")) return <MapOutlinedIcon />;
    return <HeadphonesOutlinedIcon />;
};

function HistoryPartStrip({
    item,
    previousItem,
}: {
    item: SkillMapHistoryItem;
    previousItem?: SkillMapHistoryItem;
}) {
    const previousMap = new Map(
        (previousItem?.parts ?? []).map((part) => [part.part_type, part.ability_percent])
    );

    return (
        <Box
            sx={{
                mt: 1,
                px: 1,
                py: 0.75,
                borderRadius: 1.6,
                border: `1px solid ${skillMapColors.border}`,
                bgcolor: skillMapColors.softSurface,
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr 1fr",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(7, 1fr)",
                },
                gap: 0.5,
            }}
        >
            {[...(item.parts ?? [])]
                .sort((a, b) => a.part_type - b.part_type)
                .map((part) => {
                    const previous = previousMap.get(part.part_type);
                    const delta =
                        typeof previous === "number"
                            ? part.ability_percent - previous
                            : undefined;

                    return (
                        <Box key={part.part_type} sx={{ textAlign: "center" }}>
                            <Typography sx={{ ...skillMapTextSx.caption, color: skillMapColors.navy }}>
                                Part {part.part_type}:{" "}
                                {typeof previous === "number"
                                    ? `${previous}% → ${part.ability_percent}%`
                                    : `${part.ability_percent}%`}
                            </Typography>
                            {typeof delta === "number" && (
                                <Typography
                                    sx={{
                                        ...skillMapTextSx.caption,
                                        color: delta >= 0 ? skillMapColors.strong : "#DC2626",
                                    }}
                                >
                                    {delta >= 0 ? `+${delta}%` : `${delta}%`}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
        </Box>
    );
}

function HistoryCard({
    item,
    index,
    previousItem,
}: {
    item: SkillMapHistoryItem;
    index: number;
    previousItem?: SkillMapHistoryItem;
}) {
    const weakestPart = item.weakest_parts?.[0];
    const strongestPart = [...(item.parts ?? [])].sort(
        (a, b) => b.ability_percent - a.ability_percent
    )[0];
    const score = typeof item.score === "number" ? item.score : "--";

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "42px minmax(0,1fr)" },
                gap: { xs: 0.8, md: 1.1 },
                alignItems: "flex-start",
            }}
        >
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: skillMapColors.primary,
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${skillMapColors.primaryBorder}`,
                    ...skillMapTextSx.label,
                }}
            >
                {index + 1}
            </Box>

            <Box
                sx={{
                    p: { xs: 1.1, md: 1.25 },
                    borderRadius: 2.5,
                    border: `1px solid ${skillMapColors.border}`,
                    bgcolor: "#FFFFFF",
                }}
            >
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "auto minmax(0,1fr)",
                            md: "auto 170px 95px minmax(0,1fr) auto",
                        },
                        gap: { xs: 1, md: 1.25 },
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color: skillMapColors.primary,
                            bgcolor: skillMapColors.primarySoft,
                            border: `1px solid ${skillMapColors.primaryBorder}`,
                        }}
                    >
                        {getHistoryIcon(item.label)}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ ...skillMapTextSx.sectionTitle, color: skillMapColors.navy }}>
                            {item.label}
                        </Typography>
                        <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                            {formatDate(item.submitted_at)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ ...skillMapTextSx.caption, color: skillMapColors.muted }}>
                            Điểm tổng
                        </Typography>
                        <Typography
                            sx={{
                                ...skillMapTextSx.title,
                                color: skillMapColors.navy,
                                lineHeight: 1.05,
                            }}
                        >
                            {score}
                        </Typography>
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.text }}>
                            {index === 0
                                ? "Khởi đầu của bạn. Hãy tập trung cải thiện các kỹ năng còn yếu."
                                : index === 1
                                    ? "Bạn đã cải thiện đáng kể ở các Part trọng tâm."
                                    : index === 2
                                        ? "Tiếp tục đà tiến bộ! Tập trung cải thiện Part còn yếu để bứt phá."
                                        : "Kết quả rất tốt! Duy trì sự ổn định và cải thiện thêm kỹ năng đọc hiểu."}
                        </Typography>

                        <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mt: 0.65 }}>
                            {weakestPart && (
                                <Chip
                                    label={`Yếu nhất: Part ${weakestPart}`}
                                    size="small"
                                    sx={{
                                        height: skillMapLayout.chipHeight,
                                        borderRadius: 999,
                                        color: skillMapColors.weak,
                                        bgcolor: skillMapColors.weakSoft,
                                        border: `1px solid ${skillMapColors.weakBorder}`,
                                        ...skillMapTextSx.caption,
                                    }}
                                />
                            )}

                            {strongestPart && (
                                <Chip
                                    label={`Cao nhất: Part ${strongestPart.part_type}`}
                                    size="small"
                                    sx={{
                                        height: skillMapLayout.chipHeight,
                                        borderRadius: 999,
                                        color: skillMapColors.strong,
                                        bgcolor: skillMapColors.strongSoft,
                                        border: `1px solid ${skillMapColors.strongBorder}`,
                                        ...skillMapTextSx.caption,
                                    }}
                                />
                            )}

                            <Chip
                                label={item.label}
                                size="small"
                                sx={{
                                    height: skillMapLayout.chipHeight,
                                    borderRadius: 999,
                                    color: skillMapColors.primary,
                                    bgcolor: skillMapColors.primarySoft,
                                    border: `1px solid ${skillMapColors.primaryBorder}`,
                                    ...skillMapTextSx.caption,
                                }}
                            />
                        </Stack>
                    </Box>

                    <KeyboardArrowDownOutlinedIcon sx={{ color: skillMapColors.muted }} />
                </Box>

                <HistoryPartStrip item={item} previousItem={previousItem} />
            </Box>
        </Box>
    );
}

function HistoryTab({ data }: { data: SkillMapHistoryResponse }) {
    const historiesAsc = [...(data.histories ?? [])].sort((a, b) => {
        const aTime = new Date(a.submitted_at ?? 0).getTime();
        const bTime = new Date(b.submitted_at ?? 0).getTime();
        return aTime - bTime;
    });

    const latest = historiesAsc[historiesAsc.length - 1];

    return (
        <Stack spacing={skillMapLayout.sectionGap}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: { xs: 1, md: 1.4 },
                }}
            >
                <SummaryCard
                    icon={<CalendarMonthOutlinedIcon />}
                    title="Số lần đánh giá"
                    main={`${data.summary.assessment_count ?? data.histories.length} lần`}
                    tone="good"
                />
                <SummaryCard
                    icon={<TrendingUpOutlinedIcon />}
                    title="Part cải thiện"
                    main={
                        typeof data.summary.improved_part_count === "number"
                            ? `${data.summary.improved_part_count} / 7`
                            : "-- / 7"
                    }
                    helper="từ lần đầu đến nay"
                    tone="good"
                />
                <SummaryCard
                    icon={<AccessTimeOutlinedIcon />}
                    title="Cập nhật gần nhất"
                    main={formatDate(data.summary.latest_submitted_at ?? latest?.submitted_at)}
                    helper={latest?.label}
                    tone="warning"
                />
            </Box>

            <ScoreTrendChart items={data.score_trend ?? []} />

            <Box
                sx={{
                    p: { xs: 1.1, md: 1.35 },
                    borderRadius: 2.5,
                    border: `1px solid ${skillMapColors.border}`,
                    bgcolor: "#FFFFFF",
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ ...skillMapTextSx.sectionTitle, color: skillMapColors.navy }}>
                        Lịch sử bài kiểm tra
                    </Typography>

                    <Typography sx={{ ...skillMapTextSx.caption, color: skillMapColors.muted }}>
                        {data.meta?.total ?? data.histories.length} lần cập nhật
                    </Typography>
                </Stack>

                <Stack spacing={1}>
                    {historiesAsc.map((item, index) => (
                        <HistoryCard
                            key={item.history_id}
                            item={item}
                            index={index}
                            previousItem={index > 0 ? historiesAsc[index - 1] : undefined}
                        />
                    ))}
                </Stack>
            </Box>

            <FooterNote text="Lộ trình học tập có thể được điều chỉnh sau mỗi lần kiểm tra dựa trên dữ liệu mới." />
        </Stack>
    );
}

function FooterNote({ text }: { text: string }) {
    return (
        <Stack direction="row" spacing={0.8} alignItems="center">
            <InfoOutlinedIcon sx={{ fontSize: 18, color: skillMapColors.muted }} />
            <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                {text}
            </Typography>
        </Stack>
    );
}

function SkillMapEmptyState() {
    return (
        <Box
            sx={{
                p: { xs: 2, md: 2.4 },
                borderRadius: 2.5,
                border: `1px solid ${skillMapColors.border}`,
                bgcolor: skillMapColors.softSurface,
            }}
        >
            <Typography sx={{ ...skillMapTextSx.sectionTitle, color: skillMapColors.navy }}>
                Chưa có dữ liệu năng lực
            </Typography>
            <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted, mt: 0.5 }}>
                Hãy hoàn thành Entry Test để TOEIC Smart tạo bản đồ năng lực đầu tiên.
            </Typography>
        </Box>
    );
}

export default function LearningPathSkillMapModal({
    open,
    learningPathId,
    onClose,
}: LearningPathSkillMapModalProps) {
    const [activeTab, setActiveTab] = React.useState<SkillMapTab>("parts");
    const [dataByTab, setDataByTab] = React.useState<
        Partial<Record<SkillMapTab, LearningPathSkillMapResponse>>
    >({});
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const [skillFilter, setSkillFilter] = React.useState<SkillFilterStatus>("all");
    const [searchInput, setSearchInput] = React.useState("");
    const [appliedSearchText, setAppliedSearchText] = React.useState("");
    const [localFilterLoading, setLocalFilterLoading] = React.useState(false);
    const deferredSkillFilter = React.useDeferredValue(skillFilter);
    const deferredAppliedSearchText = React.useDeferredValue(appliedSearchText);
    const isSkillFiltering =
        localFilterLoading ||
        skillFilter !== deferredSkillFilter ||
        appliedSearchText !== deferredAppliedSearchText;

    const dataByTabRef = React.useRef(dataByTab);
    const requestKeyByTabRef = React.useRef<Partial<Record<SkillMapTab, string>>>({});
    const inFlightRequestKeysRef = React.useRef(new Set<string>());
    const localFilterLoadingTimerRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        dataByTabRef.current = dataByTab;
    }, [dataByTab]);

    React.useEffect(() => {
        setDataByTab({});
        setSkillFilter("all");
        setSearchInput("");
        setAppliedSearchText("");
        setLocalFilterLoading(false);
        requestKeyByTabRef.current = {};
        inFlightRequestKeysRef.current.clear();
    }, [learningPathId]);

    React.useEffect(() => {
        return () => {
            if (localFilterLoadingTimerRef.current) {
                window.clearTimeout(localFilterLoadingTimerRef.current);
            }
        };
    }, []);

    const buildParams = React.useCallback((tab: SkillMapTab) => {
        if (tab === "history") {
            return { tab, limit: 5 };
        }

        return { tab };
    }, []);

    const loadTab = React.useCallback(
        async (tab: SkillMapTab, force = false) => {
            if (!learningPathId) return;

            const params = buildParams(tab);
            const requestKey = JSON.stringify(params);
            const inFlightKey = `${tab}:${requestKey}`;

            if (
                !force &&
                dataByTabRef.current[tab] &&
                requestKeyByTabRef.current[tab] === requestKey
            ) {
                return;
            }

            if (inFlightRequestKeysRef.current.has(inFlightKey)) {
                return;
            }

            inFlightRequestKeysRef.current.add(inFlightKey);
            setLoading(true);
            setErrorMessage(null);

            try {
                const response = await learningPathV2Service.getSkillMap(
                    learningPathId,
                    params
                );

                const payload = getApiPayload<LearningPathSkillMapResponse>(response);

                requestKeyByTabRef.current[tab] = requestKey;
                setDataByTab((prev) => ({
                    ...prev,
                    [tab]: payload,
                }));
            } catch (error) {
                console.error("Load skill map failed:", error);
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Không thể tải bản đồ năng lực."
                );
            } finally {
                inFlightRequestKeysRef.current.delete(inFlightKey);
                setLoading(false);
            }
        },
        [learningPathId, buildParams]
    );

    React.useEffect(() => {
        if (!open) return;
        loadTab(activeTab);
    }, [open, activeTab, loadTab]);

    const currentData = dataByTab[activeTab];

    const handleChangeTab = (tab: SkillMapTab) => {
        setActiveTab(tab);
        setErrorMessage(null);
    };

    const triggerLocalFilterLoading = React.useCallback(() => {
        if (localFilterLoadingTimerRef.current) {
            window.clearTimeout(localFilterLoadingTimerRef.current);
        }

        setLocalFilterLoading(true);
        localFilterLoadingTimerRef.current = window.setTimeout(() => {
            setLocalFilterLoading(false);
            localFilterLoadingTimerRef.current = null;
        }, 180);
    }, []);

    const handleChangeSkillFilter = (value: SkillFilterStatus) => {
        triggerLocalFilterLoading();
        setSkillFilter(value);
    };

    const handleChangeSearchInput = (value: string) => {
        setSearchInput(value);
    };

    const handleSubmitSearch = () => {
        triggerLocalFilterLoading();
        setAppliedSearchText(searchInput);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            transitionDuration={{ enter: 160, exit: 90 }}
            PaperProps={{
                sx: {
                    m: { xs: 1.2, sm: 2, md: 3 },
                    width: { xs: "calc(100% - 20px)", sm: "calc(100% - 48px)", md: "100%" },
                    height: skillMapLayout.modalHeight,
                    maxHeight: { xs: "calc(100% - 20px)", sm: "calc(100% - 56px)" },
                    borderRadius: { xs: 2.5, sm: 3, md: 3.25, lg: 3.5 },
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 28px 80px rgba(15,23,42,0.28)",
                },
            }}
            BackdropProps={{
                sx: {
                    bgcolor: "rgba(15,23,42,0.34)",
                    backdropFilter: "blur(4px)",
                },
            }}
        >
            <DialogContent
                sx={{
                    p: 0,
                    height: "100%",
                    overflowY: "auto",
                }}
                className="no-scrollbar"
            >
                <Box
                    sx={{
                        minHeight: "100%",
                        p: skillMapLayout.contentPadding,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <ModalHeader
                        activeTab={activeTab}
                        onChangeTab={handleChangeTab}
                        onClose={onClose}
                    />

                    <Box
                        sx={{
                            mt: skillMapLayout.sectionGap,
                            minHeight: skillMapLayout.contentMinHeight,
                        }}
                    >
                        {loading && !currentData && (
                            <Box
                                sx={{
                                    p: { xs: 2, md: 2.5 },
                                    minHeight: skillMapLayout.contentMinHeight,
                                    borderRadius: 2.5,
                                    border: `1px solid ${skillMapColors.border}`,
                                    bgcolor: skillMapColors.softSurface,
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <CircularProgress size={20} />
                                    <Typography sx={{ ...skillMapTextSx.helper, color: skillMapColors.muted }}>
                                        Đang tải bản đồ năng lực...
                                    </Typography>
                                </Stack>
                            </Box>
                        )}

                        {errorMessage && (
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                {errorMessage}
                            </Alert>
                        )}

                        {!loading && !errorMessage && !currentData && <SkillMapEmptyState />}

                        {currentData?.tab === "parts" && <PartsTab data={currentData} />}

                        {currentData?.tab === "skills" && (
                            <SkillsTab
                                data={currentData}
                                skillFilter={skillFilter}
                                filterValue={deferredSkillFilter}
                                searchInput={searchInput}
                                appliedSearchText={deferredAppliedSearchText}
                                isFiltering={isSkillFiltering}
                                onChangeFilter={handleChangeSkillFilter}
                                onChangeSearchInput={handleChangeSearchInput}
                                onSubmitSearch={handleSubmitSearch}
                            />
                        )}

                        {currentData?.tab === "history" && <HistoryTab data={currentData} />}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
