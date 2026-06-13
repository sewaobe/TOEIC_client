import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import learningPathV2Service from "../../services/learning_path_v2.service";
import type {
    LearningPathStrategyOverviewResponse,
    LearningPathStrategyType,
    SelectLearningPathStrategyOptionResponse,
    StrategyCyclePreview,
    StrategyHistoryItem,
    StrategyOptionView,
} from "../../types/learning_strategy";

type LearningPathStrategyModalProps = {
    open: boolean;
    learningPathId: string | null;
    onClose: () => void;
    onSelected?: () => void | Promise<void>;
};

type StrategyTab = "current" | "history";

type Accent = {
    color: string;
    dark: string;
    soft: string;
    softer: string;
    border: string;
    icon: React.ReactNode;
};

const colors = {
    blue: "#2653D9",
    blueDark: "#1238C8",
    blueSoft: "#EEF4FF",
    green: "#16823A",
    greenDark: "#0D6B2F",
    greenSoft: "#EAF7EE",
    purple: "#5427C8",
    purpleDark: "#4320A5",
    purpleSoft: "#F2ECFF",
    navy: "#101A3D",
    text: "#4A5578",
    muted: "#6A728C",
    border: "#DDE3F0",
    borderStrong: "#C8D3EA",
    surface: "#FFFFFF",
    softSurface: "#F8FAFF",
};

const textSx = {
    title: { fontSize: 20, fontWeight: 900, lineHeight: 1.25, color: colors.navy },
    body: { fontSize: 14, fontWeight: 500, lineHeight: 1.55, color: colors.text },
    label: { fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: colors.navy },
    caption: { fontSize: 12, fontWeight: 700, lineHeight: 1.35, color: colors.muted },
};

const strategyAccents: Record<LearningPathStrategyType, Accent> = {
    recommended: {
        color: colors.blue,
        dark: colors.blueDark,
        soft: colors.blueSoft,
        softer: "#F7FAFF",
        border: "#8AA7FF",
        icon: <TrackChangesIcon />,
    },
    balanced: {
        color: colors.green,
        dark: colors.greenDark,
        soft: colors.greenSoft,
        softer: "#F8FCF9",
        border: "#8FD4A4",
        icon: <BalanceOutlinedIcon />,
    },
    opportunity: {
        color: colors.purple,
        dark: colors.purpleDark,
        soft: colors.purpleSoft,
        softer: "#FBF8FF",
        border: "#A891F4",
        icon: <TrendingUpOutlinedIcon />,
    },
};

const getApiPayload = <T,>(response: any): T => {
    return (response?.data?.data ?? response?.data) as T;
};

const formatMinutes = (minutes?: number) => {
    const value = Number(minutes ?? 0);
    if (!Number.isFinite(value)) return "0 phút";
    return `${Math.round(value).toLocaleString("vi-VN")} phút`;
};

const formatNumber = (value?: number) => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return "0";
    return numeric.toLocaleString("vi-VN");
};

const formatGain = (gain?: number) => {
    const value = Number(gain ?? 0);
    if (!Number.isFinite(value)) return "+0 điểm";
    return `+${Math.round(value * 100) / 100} điểm`;
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

const getStrategyAccent = (strategy: LearningPathStrategyType) =>
    strategyAccents[strategy] ?? strategyAccents.recommended;

const getStrategyDisplayName = (
    strategy: LearningPathStrategyType,
    fallback: string
) => {
    if (strategy === "recommended") return "Tập trung cải thiện Part yếu";
    if (strategy === "balanced") return "Cân bằng năng lực";
    if (strategy === "opportunity") return "Cơ hội tăng điểm";
    return fallback;
};

const getHeaderSubtitle = (
    tab: StrategyTab,
    mode?: LearningPathStrategyOverviewResponse["mode"],
    previewOption?: StrategyOptionView | null
) => {
    if (previewOption) return "Xem cycle dự kiến trước khi xác nhận chiến lược học tập.";
    if (tab === "history") return "Xem lại lịch sử điều chỉnh chiến lược học tập của bạn.";
    if (mode === "pending_selection") {
        return "Tối ưu hướng học tập dựa trên năng lực hiện tại và thời gian còn lại.";
    }
    return "TOEIC Smart tối ưu hướng học dựa trên năng lực hiện tại và thời gian học còn lại.";
};

function AppIcon({ accent = colors.blue }: { accent?: string }) {
    return (
        <Box
            sx={{
                width: 54,
                height: 54,
                borderRadius: "18px",
                display: "grid",
                placeItems: "center",
                color: accent,
                bgcolor: "#EEF3FF",
                boxShadow: "0 12px 26px rgba(38,83,217,0.12)",
                flex: "0 0 auto",
                "& svg": { fontSize: 30 },
            }}
        >
            <TrackChangesIcon />
        </Box>
    );
}

function ModalHeader({
    activeTab,
    mode,
    previewOption,
    onChangeTab,
    onClose,
}: {
    activeTab: StrategyTab;
    mode?: LearningPathStrategyOverviewResponse["mode"];
    previewOption?: StrategyOptionView | null;
    onChangeTab: (tab: StrategyTab) => void;
    onClose: () => void;
}) {
    const tabs: Array<{ value: StrategyTab; label: string }> = [
        { value: "current", label: "Hiện tại" },
        { value: "history", label: "Lịch sử" },
    ];

    return (
        <Box sx={{ borderBottom: `1px solid ${colors.border}` }}>
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={2}
                sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                    <AppIcon />

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={textSx.title}>Chiến lược</Typography>
                        <Typography sx={{ ...textSx.body, mt: 0.4 }}>
                            {getHeaderSubtitle(activeTab, mode, previewOption)}
                        </Typography>
                    </Box>
                </Stack>

                <IconButton
                    onClick={onClose}
                    sx={{
                        width: 40,
                        height: 40,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "12px",
                        color: colors.navy,
                        bgcolor: colors.surface,
                        "&:hover": { bgcolor: colors.softSurface },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 22 }} />
                </IconButton>
            </Stack>

            {!previewOption && (
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{ px: { xs: 2, md: 3 }, mt: 2.4 }}
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
                                    px: 0.4,
                                    py: 1.2,
                                    borderRadius: 0,
                                    textTransform: "none",
                                    fontSize: 14,
                                    fontWeight: 800,
                                    color: active ? colors.blueDark : colors.text,
                                    borderBottom: active
                                        ? `3px solid ${colors.blueDark}`
                                        : "3px solid transparent",
                                    "&:hover": {
                                        bgcolor: "transparent",
                                        color: colors.blueDark,
                                    },
                                }}
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}

function StatusChip({
    label,
    tone = "blue",
    icon,
}: {
    label: string;
    tone?: "blue" | "green" | "orange" | "gray";
    icon?: React.ReactElement;
}) {
    const toneMap = {
        blue: { color: colors.blue, bg: "#EDF4FF", border: "#C7D8FF" },
        green: { color: colors.green, bg: "#EAF7EE", border: "#BDE6C9" },
        orange: { color: "#D87313", bg: "#FFF3E4", border: "#FFD5A8" },
        gray: { color: colors.muted, bg: "#F7F8FC", border: colors.border },
    };
    const selected = toneMap[tone];

    return (
        <Chip
            size="small"
            icon={icon}
            label={label}
            sx={{
                height: 28,
                borderRadius: "8px",
                bgcolor: selected.bg,
                border: `1px solid ${selected.border}`,
                color: selected.color,
                fontSize: 12,
                fontWeight: 800,
                "& .MuiChip-icon": {
                    color: selected.color,
                    fontSize: "16px !important",
                    ml: 0.8,
                },
                "& .MuiChip-label": { px: 1 },
            }}
        />
    );
}

function PillChips({
    items,
    accent = strategyAccents.recommended,
}: {
    items: Array<string | number>;
    accent?: Accent;
    limit?: number;
}) {
    if (!items.length) {
        return <Typography sx={textSx.caption}>--</Typography>;
    }

    return (
        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {items.map((item) => (
                <Chip
                    key={String(item)}
                    size="small"
                    label={typeof item === "number" ? `Part ${item}` : item}
                    sx={{
                        height: 28,
                        borderRadius: "8px",
                        bgcolor: accent.soft,
                        color: accent.dark,
                        border: `1px solid ${accent.border}66`,
                        fontSize: 12,
                        fontWeight: 800,
                        "& .MuiChip-label": { px: 1.2 },
                    }}
                />
            ))}
        </Stack>
    );
}

function MetricBox({
    icon,
    label,
    value,
    accent = strategyAccents.recommended,
    tooltip,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    accent?: Accent;
    tooltip?: string;
}) {
    return (
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: accent.color,
                    bgcolor: accent.soft,
                    flex: "0 0 auto",
                    "& svg": { fontSize: 22 },
                }}
            >
                {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={0.6} alignItems="center">
                    <Typography sx={textSx.caption}>{label}</Typography>
                    {tooltip && (
                        <Tooltip title={tooltip} arrow>
                            <InfoOutlinedIcon
                                sx={{ fontSize: 16, color: colors.muted, cursor: "help" }}
                            />
                        </Tooltip>
                    )}
                </Stack>
                <Box sx={{ mt: 0.2 }}>{value}</Box>
            </Box>
        </Stack>
    );
}

function ReasonList({
    reasons,
    accent = strategyAccents.recommended,
    compact = false,
}: {
    reasons: string[];
    accent?: Accent;
    compact?: boolean;
}) {
    const visibleReasons = reasons.length
        ? reasons.slice(0, compact ? 3 : 4)
        : ["Chưa có căn cứ lựa chọn cho chiến lược này."];

    return (
        <Stack spacing={compact ? 0.7 : 0.8}>
            {visibleReasons.map((reason, index) => (
                <Stack
                    key={`${reason}-${index}`}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{
                        px: compact ? 0 : 1.4,
                        py: compact ? 0.2 : 1,
                        borderRadius: compact ? 0 : "8px",
                        bgcolor: compact ? "transparent" : colors.surface,
                        border: compact ? "none" : `1px solid ${colors.border}`,
                    }}
                >
                    <CheckCircleOutlineIcon
                        sx={{
                            mt: 0.1,
                            fontSize: 18,
                            color: accent.color,
                            flex: "0 0 auto",
                        }}
                    />
                    <Typography sx={{ ...textSx.body, fontSize: compact ? 12 : 14 }}>
                        {reason}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
}

function InfoNote({ children }: { children: React.ReactNode }) {
    return (
        <Stack
            direction="row"
            spacing={1.4}
            alignItems="flex-start"
            sx={{
                p: 1.8,
                borderRadius: "10px",
                bgcolor: "#F1F6FF",
                border: "1px solid #95B7FF",
                color: colors.blueDark,
            }}
        >
            <InfoOutlinedIcon sx={{ fontSize: 22, flex: "0 0 auto", mt: 0.1 }} />
            <Typography sx={{ ...textSx.body, color: colors.blueDark }}>{children}</Typography>
        </Stack>
    );
}

function SelectedCurrentView({
    option,
    tooltip,
}: {
    option: StrategyOptionView;
    tooltip: string;
}) {
    const accent = getStrategyAccent(option.strategy);

    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    p: { xs: 2, md: 2.2 },
                    borderRadius: "12px",
                    bgcolor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 14px 34px rgba(16,26,61,0.08)",
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <StatusChip
                            label="Đang áp dụng"
                            tone="green"
                            icon={<CheckCircleOutlineIcon />}
                        />
                        <Typography sx={{ ...textSx.title, mt: 1.3 }}>
                            {getStrategyDisplayName(option.strategy, option.strategy_label)}
                        </Typography>
                        <Typography sx={{ ...textSx.body, mt: 0.8, maxWidth: 680 }}>
                            {option.strategy_description}
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                        sx={{
                            minWidth: { xs: "auto", md: 320 },
                            p: 1.6,
                            borderRadius: "10px",
                            bgcolor: colors.softSurface,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: accent.soft,
                                color: accent.color,
                                flex: "0 0 auto",
                            }}
                        >
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography sx={textSx.caption}>Bối cảnh tạo chiến lược</Typography>
                            <Typography sx={{ ...textSx.label, mt: 0.3 }}>
                                {option.scenario_label}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr" },
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    bgcolor: colors.surface,
                    overflow: "hidden",
                }}
            >
                <Box sx={{ p: 1.8 }}>
                    <MetricBox
                        icon={<FlagOutlinedIcon />}
                        label="Part trọng tâm"
                        value={<PillChips items={option.focus_part_types ?? []} accent={accent} />}
                        accent={accent}
                    />
                </Box>
                <Box sx={{ p: 1.8, borderLeft: { md: `1px solid ${colors.border}` } }}>
                    <MetricBox
                        icon={<AccessTimeOutlinedIcon />}
                        label="Thời lượng roadmap"
                        value={
                            <Typography sx={{ ...textSx.title }}>
                                {formatNumber(option.estimated_total_minutes)}
                                <Typography component="span" sx={{ ...textSx.body, ml: 0.8 }}>
                                    phút
                                </Typography>
                            </Typography>
                        }
                        accent={accent}
                    />
                </Box>
                <Box sx={{ p: 1.8, borderLeft: { md: `1px solid ${colors.border}` } }}>
                    <MetricBox
                        icon={<TrendingUpOutlinedIcon />}
                        label="Dự kiến tăng"
                        value={
                            <Typography sx={{ ...textSx.title, color: colors.green }}>
                                {formatGain(option.estimated_gain)}
                            </Typography>
                        }
                        accent={{ ...accent, color: colors.green, soft: colors.greenSoft }}
                        tooltip={tooltip}
                    />
                </Box>
            </Box>

            <Box>
                <Typography sx={{ ...textSx.label, mb: 1 }}>Kỹ năng tập trung</Typography>
                <PillChips items={option.focus_skill_labels ?? []} accent={accent} />
            </Box>

            <Box>
                <Typography sx={{ ...textSx.label, mb: 1 }}>
                    Vì sao chiến lược này phù hợp?
                </Typography>
                <ReasonList reasons={option.summary_reasons ?? []} accent={accent} />
            </Box>

            <InfoNote>
                Cycle chi tiết đã được hiển thị ở Canvas bên ngoài. Mini Test sẽ cập nhật năng lực và tiếp tục chiến lược hiện tại; Full Test mới tạo các lựa chọn chiến lược mới.
            </InfoNote>
        </Stack>
    );
}

function StrategyCard({
    option,
    tooltip,
    recommended,
    selecting,
    previewing,
    onPreview,
    onSelect,
}: {
    option: StrategyOptionView;
    tooltip: string;
    recommended?: boolean;
    selecting: boolean;
    previewing: boolean;
    onPreview: (option: StrategyOptionView) => void;
    onSelect: (option: StrategyOptionView) => void;
}) {
    const accent = getStrategyAccent(option.strategy);

    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minHeight: 520,
                p: 1.8,
                borderRadius: "12px",
                bgcolor: colors.surface,
                border: `1px solid ${recommended ? colors.blue : accent.border}`,
                borderTop: `5px solid ${accent.color}`,
                boxShadow: recommended
                    ? "0 18px 38px rgba(38,83,217,0.14)"
                    : "0 12px 28px rgba(16,26,61,0.06)",
            }}
        >
            {recommended && (
                <Chip
                    icon={<CheckCircleOutlineIcon />}
                    label="Khuyến nghị"
                    size="small"
                    sx={{
                        position: "absolute",
                        top: -14,
                        right: 16,
                        height: 28,
                        borderRadius: "8px",
                        bgcolor: colors.blue,
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 900,
                        "& .MuiChip-icon": {
                            color: "#FFFFFF",
                            fontSize: "16px !important",
                        },
                    }}
                />
            )}

            <Stack direction="row" spacing={1.4} alignItems="center">
                <Box
                    sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: accent.soft,
                        color: accent.color,
                        flex: "0 0 auto",
                        "& svg": { fontSize: 32 },
                    }}
                >
                    {accent.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ ...textSx.title, color: accent.dark }}>
                        {getStrategyDisplayName(option.strategy, option.strategy_label)}
                    </Typography>
                    <Typography sx={{ ...textSx.body, mt: 0.4 }}>
                        {option.strategy_description}
                    </Typography>
                </Box>
            </Stack>

            <Divider sx={{ my: 1.6 }} />

            <Stack spacing={1.5}>
                <MetricBox
                    icon={<CalendarMonthOutlinedIcon />}
                    label="Bối cảnh tạo chiến lược"
                    value={<Typography sx={textSx.body}>{option.scenario_label}</Typography>}
                    accent={accent}
                />
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                        <FlagOutlinedIcon sx={{ fontSize: 20, color: accent.color }} />
                        <Typography sx={textSx.label}>Part trọng tâm</Typography>
                    </Stack>
                    <PillChips items={option.focus_part_types ?? []} accent={accent} />
                </Box>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                        <SchoolOutlinedIcon sx={{ fontSize: 20, color: accent.color }} />
                        <Typography sx={textSx.label}>Kỹ năng tập trung</Typography>
                    </Stack>
                    <PillChips
                        items={option.focus_skill_labels ?? option.focus_skill_keys ?? []}
                        accent={accent}
                        limit={3}
                    />
                </Box>
            </Stack>

            <Divider sx={{ my: 1.6 }} />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.4,
                }}
            >
                <MetricBox
                    icon={<AccessTimeOutlinedIcon />}
                    label="Roadmap"
                    value={
                        <Typography sx={{ ...textSx.label, color: accent.dark }}>
                            {formatMinutes(option.estimated_total_minutes)}
                        </Typography>
                    }
                    accent={accent}
                />
                <MetricBox
                    icon={<TrendingUpOutlinedIcon />}
                    label="Dự kiến tăng"
                    value={
                        <Typography sx={{ ...textSx.label, color: accent.dark }}>
                            {formatGain(option.estimated_gain)}
                        </Typography>
                    }
                    accent={accent}
                    tooltip={tooltip}
                />
            </Box>

            <Divider sx={{ my: 1.6 }} />

            <Box sx={{ flex: 1 }}>
                <Typography sx={{ ...textSx.label, color: accent.dark, mb: 1 }}>
                    Lý do đề xuất
                </Typography>
                <ReasonList
                    reasons={option.summary_reasons ?? []}
                    accent={accent}
                    compact
                />
            </Box>

            <Stack direction="row" spacing={1.2} sx={{ mt: 1.8 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={previewing ? <CircularProgress size={16} /> : <VisibilityOutlinedIcon />}
                    onClick={() => onPreview(option)}
                    disabled={selecting || previewing}
                    sx={{
                        height: 44,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: 14,
                        fontWeight: 850,
                        color: accent.dark,
                        borderColor: accent.border,
                        "&:hover": {
                            borderColor: accent.color,
                            bgcolor: accent.soft,
                        },
                    }}
                >
                    Xem cycle dự kiến
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => onSelect(option)}
                    disabled={selecting}
                    sx={{
                        height: 44,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: 14,
                        fontWeight: 900,
                        bgcolor: accent.color,
                        boxShadow: `0 12px 22px ${accent.color}33`,
                        "&:hover": { bgcolor: accent.dark },
                    }}
                >
                    {selecting ? "Đang chọn..." : "Chọn"}
                </Button>
            </Stack>
        </Box>
    );
}

function PendingSelectionView({
    options,
    tooltip,
    onPreview,
    onSelect,
    selectingOptionId,
    previewingOptionId,
}: {
    options: StrategyOptionView[];
    tooltip: string;
    onPreview: (option: StrategyOptionView) => void;
    onSelect: (option: StrategyOptionView) => void;
    selectingOptionId: string | null;
    previewingOptionId: string | null;
}) {
    return (
        <Stack spacing={2}>
            <InfoNote>
                Full Test đã tạo 3 hướng chiến lược phù hợp. Bạn có thể xem cycle dự kiến trước khi chọn.
            </InfoNote>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
                    gap: 2,
                }}
            >
                {options.map((option) => (
                    <StrategyCard
                        key={option.option_id}
                        option={option}
                        tooltip={tooltip}
                        recommended={option.strategy === "recommended"}
                        selecting={selectingOptionId === option.option_id}
                        previewing={previewingOptionId === option.option_id}
                        onPreview={onPreview}
                        onSelect={onSelect}
                    />
                ))}
            </Box>

            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <InfoOutlinedIcon sx={{ fontSize: 18, color: colors.muted }} />
                <Typography sx={textSx.body}>
                    Sau khi chọn, bạn có thể xem chi tiết roadmap và bắt đầu thực hiện ngay.
                </Typography>
            </Stack>
        </Stack>
    );
}

function PreviewView({
    option,
    preview,
    onBack,
    onSelect,
    selecting,
}: {
    option: StrategyOptionView;
    preview: StrategyCyclePreview;
    onBack: () => void;
    onSelect: () => void;
    selecting: boolean;
}) {
    const accent = getStrategyAccent(option.strategy);

    return (
        <Stack spacing={2}>
            <Box>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={onBack}
                    sx={{
                        height: 40,
                        px: 1.8,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: 14,
                        fontWeight: 800,
                        color: colors.text,
                        borderColor: colors.borderStrong,
                        bgcolor: colors.surface,
                        "&:hover": {
                            bgcolor: colors.softSurface,
                            borderColor: colors.blue,
                        },
                    }}
                >
                    Quay lại lựa chọn chiến lược
                </Button>
            </Box>

            <Box
                sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: accent.softer,
                    border: `1px solid ${accent.border}`,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1.3fr 0.8fr 0.8fr" },
                    gap: 2,
                    alignItems: "center",
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 58,
                            height: 58,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: accent.soft,
                            color: accent.color,
                            "& svg": { fontSize: 30 },
                        }}
                    >
                        {accent.icon}
                    </Box>
                    <Box>
                        <StatusChip label="Preview" tone="blue" />
                        <Typography sx={{ ...textSx.title, mt: 0.7 }}>
                            {getStrategyDisplayName(option.strategy, option.strategy_label)}
                        </Typography>
                        <Typography sx={textSx.body}>{option.scenario_label}</Typography>
                    </Box>
                </Stack>

                <Box sx={{ borderLeft: { md: `1px solid ${colors.border}` }, pl: { md: 2 } }}>
                    <MetricBox
                        icon={<AccessTimeOutlinedIcon />}
                        label="Thời lượng cycle"
                        value={
                            <Typography sx={textSx.title}>
                                {formatMinutes(preview.estimated_learning_minutes)}
                            </Typography>
                        }
                        accent={accent}
                    />
                </Box>

                <Box sx={{ borderLeft: { md: `1px solid ${colors.border}` }, pl: { md: 2 } }}>
                    <MetricBox
                        icon={<TrendingUpOutlinedIcon />}
                        label="Dự kiến tăng"
                        value={
                            <Typography sx={{ ...textSx.title, color: colors.green }}>
                                {formatGain(option.estimated_gain)}
                            </Typography>
                        }
                        accent={{ ...accent, color: colors.green, soft: colors.greenSoft }}
                    />
                </Box>
            </Box>

            <Typography sx={textSx.title}>
                Cycle dự kiến nếu chọn chiến lược này
            </Typography>

            {preview.status === "route_completed" ? (
                <Alert severity="success" sx={{ borderRadius: "10px", fontSize: 14 }}>
                    {preview.route_completed_reason ?? "Roadmap đã hoàn tất."}
                </Alert>
            ) : (
                <Stack spacing={1.4}>
                    {preview.groups.map((group) => (
                        <Box
                            key={group.part_type}
                            sx={{
                                borderRadius: "10px",
                                border: `1px solid ${colors.border}`,
                                overflow: "hidden",
                                bgcolor: colors.surface,
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    px: 1.8,
                                    py: 1.2,
                                    borderBottom: `1px solid ${colors.border}`,
                                    bgcolor: colors.softSurface,
                                }}
                            >
                                <Typography sx={textSx.label}>{group.part_label}</Typography>
                                <Typography sx={textSx.caption}>
                                    {group.unit_count} bài · {formatMinutes(group.total_minutes)}
                                </Typography>
                            </Stack>

                            <Stack divider={<Divider />}>
                                {group.units.map((unit, index) => (
                                    <Box
                                        key={`${unit.lesson_manager_id}-${index}`}
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                md: "minmax(0, 1fr) minmax(0, 1.4fr) auto",
                                            },
                                            gap: 1.4,
                                            px: 1.8,
                                            py: 1.1,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography sx={textSx.label}>
                                            {index + 1}. {unit.title}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                ...textSx.caption,
                                                fontWeight: 500,
                                                color: colors.muted,
                                            }}
                                        >
                                            {unit.target_tags?.slice(0, 3).join(" · ") ||
                                                unit.reason ||
                                                "Bài học trong cycle"}
                                        </Typography>
                                        <Stack
                                            direction="row"
                                            spacing={0.8}
                                            justifyContent={{ xs: "flex-start", md: "flex-end" }}
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                        {unit.unit_source === "alternative" && (
                                            <Tooltip title="Main graph của Part này đã hết, hệ thống chọn bài cùng Part và gần năng lực hiện tại.">
                                                <Chip
                                                    label="Bài thay thế"
                                                    size="small"
                                                    sx={{
                                                        height: 26,
                                                        borderRadius: "8px",
                                                        bgcolor: "#FFF4DE",
                                                        border: "1px solid rgba(245,158,11,0.32)",
                                                        color: "#8A4B00",
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                        <Chip
                                            icon={<AccessTimeOutlinedIcon />}
                                            label={formatMinutes(unit.planned_minutes)}
                                            size="small"
                                            sx={{
                                                height: 30,
                                                borderRadius: "8px",
                                                bgcolor: colors.surface,
                                                border: `1px solid ${colors.borderStrong}`,
                                                color: colors.text,
                                                fontSize: 12,
                                                fontWeight: 800,
                                                "& .MuiChip-icon": {
                                                    color: colors.muted,
                                                    fontSize: "16px !important",
                                                },
                                            }}
                                        />
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}

            <InfoNote>
                Đây là cycle dự kiến nếu bạn chọn chiến lược này. Cycle chính thức chỉ được tạo sau khi xác nhận.
            </InfoNote>

            <Stack direction="row" spacing={1.4} justifyContent="flex-end">
                <Button
                    variant="outlined"
                    onClick={onBack}
                    sx={{
                        minWidth: 130,
                        height: 46,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: 14,
                        fontWeight: 850,
                    }}
                >
                    Quay lại
                </Button>
                <Button
                    variant="contained"
                    onClick={onSelect}
                    disabled={selecting}
                    sx={{
                        minWidth: 210,
                        height: 46,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: 14,
                        fontWeight: 900,
                        bgcolor: colors.blueDark,
                        "&:hover": { bgcolor: colors.blue },
                    }}
                >
                    {selecting ? "Đang chọn..." : "Chọn chiến lược này"}
                </Button>
            </Stack>
        </Stack>
    );
}

function HistoryMetric({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: Accent;
}) {
    return (
        <Stack
            direction="row"
            spacing={1.8}
            alignItems="center"
            sx={{
                p: 2,
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                bgcolor: colors.surface,
            }}
        >
            <Box
                sx={{
                    width: 58,
                    height: 58,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: accent.soft,
                    color: accent.color,
                    flex: "0 0 auto",
                    "& svg": { fontSize: 30 },
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography sx={textSx.body}>{label}</Typography>
                <Typography sx={{ ...textSx.title, color: accent.dark }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
}

function HistoryTab({ history }: { history: StrategyHistoryItem[] }) {
    if (!history.length) {
        return (
            <Alert severity="info" sx={{ borderRadius: "10px", fontSize: 14 }}>
                Chưa có lịch sử chiến lược.
            </Alert>
        );
    }

    const latestExpiredStrategy = history[0];
    const latestExpiredStrategyName = latestExpiredStrategy
        ? getStrategyDisplayName(
            latestExpiredStrategy.strategy as LearningPathStrategyType,
            latestExpiredStrategy.strategy_label
        )
        : "Chưa có";
    const fullTestCount = history.filter(
        (item) => item.trigger_type === "full_test_review"
    ).length;

    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 2,
                }}
            >
                <HistoryMetric
                    icon={<CalendarMonthOutlinedIcon />}
                    label="Số lần thay thế"
                    value={`${history.length} lần`}
                    accent={strategyAccents.recommended}
                />
                <HistoryMetric
                    icon={<CheckCircleOutlineIcon />}
                    label="Lần gần nhất"
                    value={latestExpiredStrategyName}
                    accent={strategyAccents.balanced}
                />
                <HistoryMetric
                    icon={<AutoGraphOutlinedIcon />}
                    label="Sau Full Test"
                    value={`${fullTestCount} lần`}
                    accent={strategyAccents.recommended}
                />
            </Box>

            <Stack spacing={1.4}>
                {history.map((item) => {
                    const strategy = item.strategy as LearningPathStrategyType;
                    const accent = getStrategyAccent(strategy);
                    const statusTone =
                        item.status === "selected"
                            ? "green"
                            : item.status === "dismissed"
                                ? "gray"
                                : item.status === "expired"
                                    ? "orange"
                                    : "blue";

                    return (
                        <Box
                            key={item.option_id}
                            sx={{
                                p: 1.6,
                                borderRadius: "12px",
                                border: `1px solid ${colors.border}`,
                                bgcolor: colors.surface,
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "160px minmax(0, 1fr) 280px",
                                },
                                gap: 1.8,
                                alignItems: "center",
                            }}
                        >
                            <Stack spacing={0.8} alignItems="flex-start">
                                <StatusChip
                                    label={item.trigger_label}
                                    tone={item.trigger_type === "mini_test_completion" ? "green" : "blue"}
                                    icon={<HistoryOutlinedIcon />}
                                />
                                <StatusChip
                                    label={item.status_label}
                                    tone={statusTone}
                                />
                            </Stack>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={textSx.title}>
                                    {getStrategyDisplayName(strategy, item.strategy_label)}
                                </Typography>
                                <Typography sx={{ ...textSx.body, mt: 0.4 }}>
                                    {item.scenario_label} · {formatDate(item.created_at)}
                                </Typography>
                                {item.summary_reason && (
                                    <Typography sx={{ ...textSx.body, mt: 0.8 }}>
                                        {item.summary_reason}
                                    </Typography>
                                )}
                            </Box>

                            <Stack
                                direction="row"
                                spacing={1.4}
                                justifyContent={{ xs: "space-between", md: "flex-end" }}
                                alignItems="center"
                            >
                                <PillChips
                                    items={item.focus_part_types ?? []}
                                    accent={accent}
                                    limit={4}
                                />
                                <Divider orientation="vertical" flexItem />
                                <Box sx={{ minWidth: 100 }}>
                                    <Typography sx={textSx.caption}>Ước tính tăng</Typography>
                                    <Typography sx={{ ...textSx.label, color: colors.green, mt: 0.5 }}>
                                        {formatGain(item.estimated_gain)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>

            <InfoNote>
                Lịch sử chiến lược giúp bạn hiểu cách TOEIC Smart điều chỉnh hướng học sau mỗi lần đánh giá.
            </InfoNote>
        </Stack>
    );
}

export default function LearningPathStrategyModal({
    open,
    learningPathId,
    onClose,
    onSelected,
}: LearningPathStrategyModalProps) {
    const [activeTab, setActiveTab] = React.useState<StrategyTab>("current");
    const [data, setData] =
        React.useState<LearningPathStrategyOverviewResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [previewOption, setPreviewOption] =
        React.useState<StrategyOptionView | null>(null);
    const [selectingOptionId, setSelectingOptionId] = React.useState<string | null>(
        null
    );
    const [previewingOptionId, setPreviewingOptionId] = React.useState<string | null>(
        null
    );
    const [routeCompletedMessage, setRouteCompletedMessage] =
        React.useState<string | null>(null);

    const loadData = React.useCallback(async () => {
        if (!open || !learningPathId) return;

        try {
            setLoading(true);
            setErrorMessage(null);

            const response = await learningPathV2Service.getStrategy(learningPathId);
            const payload =
                getApiPayload<LearningPathStrategyOverviewResponse>(response);

            setData(payload);
        } catch (error) {
            console.error("Tải chiến lược thất bại", error);
            setErrorMessage("Không thể tải dữ liệu chiến lược. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [open, learningPathId]);

    React.useEffect(() => {
        if (open) {
            setActiveTab("current");
            setPreviewOption(null);
            setPreviewingOptionId(null);
            setRouteCompletedMessage(null);
            loadData();
        }
    }, [open, loadData]);

    const handlePreview = async (option: StrategyOptionView) => {
        if (!learningPathId) return;

        if (option.preview_cycle) {
            setPreviewOption(option);
            return;
        }

        try {
            setPreviewingOptionId(option.option_id);
            setErrorMessage(null);
            setRouteCompletedMessage(null);

            const response = await learningPathV2Service.getStrategyOptionPreview(
                learningPathId,
                option.option_id
            );
            const preview = getApiPayload<StrategyCyclePreview>(response);
            const nextOption = { ...option, preview_cycle: preview };

            setData((current) => {
                if (!current) return current;
                return {
                    ...current,
                    pending_options: current.pending_options.map((item) =>
                        item.option_id === option.option_id ? nextOption : item
                    ),
                    current_option:
                        current.current_option?.option_id === option.option_id
                            ? nextOption
                            : current.current_option,
                };
            });
            setPreviewOption(nextOption);
        } catch (error) {
            console.error("Táº£i cycle dá»± kiáº¿n tháº¥t báº¡i", error);
            setErrorMessage("KhÃ´ng thá»ƒ táº£i cycle dá»± kiáº¿n. Vui lÃ²ng thá»­ láº¡i.");
        } finally {
            setPreviewingOptionId(null);
        }
    };

    const handleSelect = async (option: StrategyOptionView) => {
        if (!learningPathId) return;

        try {
            setSelectingOptionId(option.option_id);
            setErrorMessage(null);
            setRouteCompletedMessage(null);

            const response = await learningPathV2Service.selectStrategyOption(
                learningPathId,
                option.option_id
            );
            const payload =
                getApiPayload<SelectLearningPathStrategyOptionResponse>(response);

            if (payload.cycle_status === "route_completed") {
                setRouteCompletedMessage(
                    "Hệ thống không còn đủ bài học phù hợp với năng lực hiện tại. Vui lòng liên hệ quản trị viên để bổ sung nội dung hoặc điều chỉnh lộ trình."
                );
                await loadData();
                return;
            }

            await loadData();
            setPreviewOption(null);
            await onSelected?.();
        } catch (error) {
            console.error("Chọn chiến lược thất bại", error);
            setErrorMessage("Không thể chọn chiến lược. Vui lòng thử lại.");
        } finally {
            setSelectingOptionId(null);
        }
    };

    const content = (() => {
        if (!learningPathId) {
            return (
                <Alert severity="warning" sx={{ borderRadius: "10px", fontSize: 14 }}>
                    Không tìm thấy LearningPath để tải chiến lược.
                </Alert>
            );
        }

        if (loading) {
            return (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            );
        }

        if (errorMessage) {
            return (
                <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 14 }}>
                    {errorMessage}
                </Alert>
            );
        }

        if (routeCompletedMessage) {
            return (
                <Alert severity="warning" sx={{ borderRadius: "10px", fontSize: 14 }}>
                    {routeCompletedMessage}
                </Alert>
            );
        }

        if (!data) {
            return (
                <Alert severity="info" sx={{ borderRadius: "10px", fontSize: 14 }}>
                    Chưa có dữ liệu chiến lược.
                </Alert>
            );
        }

        if (activeTab === "history") {
            return <HistoryTab history={data.history ?? []} />;
        }

        if (previewOption?.preview_cycle) {
            return (
                <PreviewView
                    option={previewOption}
                    preview={previewOption.preview_cycle}
                    onBack={() => setPreviewOption(null)}
                    onSelect={() => handleSelect(previewOption)}
                    selecting={selectingOptionId === previewOption.option_id}
                />
            );
        }

        if (data.mode === "pending_selection") {
            return (
                <PendingSelectionView
                    options={data.pending_options ?? []}
                    tooltip={data.copy?.estimated_gain_tooltip ?? ""}
                    onPreview={handlePreview}
                    onSelect={handleSelect}
                    selectingOptionId={selectingOptionId}
                    previewingOptionId={previewingOptionId}
                />
            );
        }

        if (data.mode === "selected_current" && data.current_option) {
            return (
                <SelectedCurrentView
                    option={data.current_option}
                    tooltip={data.copy?.estimated_gain_tooltip ?? ""}
                />
            );
        }

        return (
            <Alert severity="info" sx={{ borderRadius: "10px", fontSize: 14 }}>
                Chưa có chiến lược học tập cho lộ trình này.
            </Alert>
        );
    })();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            slotProps={{
                backdrop: {
                    sx: {
                        bgcolor: "rgba(15,23,42,0.54)",
                        backdropFilter: "blur(8px)",
                    },
                },
            }}
            PaperProps={{
                sx: {
                    width: {
                        xs: "100%",
                        sm: "min(1040px, calc(100% - 40px))",
                        lg: "min(1180px, calc(100% - 80px))",
                    },
                    height: {
                        xs: "100%",
                        sm: "min(860px, calc(100% - 48px))",
                    },
                    maxHeight: { xs: "100%", sm: "calc(100% - 48px)" },
                    m: { xs: 0, sm: 3 },
                    borderRadius: { xs: 0, sm: "18px" },
                    bgcolor: colors.surface,
                    overflow: "hidden",
                    boxShadow: "0 28px 90px rgba(15,23,42,0.34)",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <ModalHeader
                activeTab={activeTab}
                mode={data?.mode}
                previewOption={previewOption}
                onChangeTab={(tab) => {
                    setActiveTab(tab);
                    setPreviewOption(null);
                }}
                onClose={onClose}
            />

            <DialogContent
                sx={{
                    p: { xs: 2, md: 3 },
                    bgcolor: colors.surface,
                    overflow: "auto",
                    flex: 1,
                    minHeight: 0,
                }}
            >
                {content}
            </DialogContent>
        </Dialog>
    );
}
