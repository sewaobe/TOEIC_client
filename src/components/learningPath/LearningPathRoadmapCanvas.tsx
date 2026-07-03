import * as React from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CheckIcon from "@mui/icons-material/Check";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LearningPathNodeDetailModal from "./LearningPathNodeDetailModal";
import learningPathV2Service, {
    LearningPathCycleExplanationResponse,
    LearningPathNodeDetailResponse,
} from "../../services/learning_path_v2.service";
import LearningPathSkillMapModal from "./LearningPathSkillMapModal";
import LearningPathCycleExplanationModal, {
    unwrapCycleExplanationPayload,
} from "./LearningPathCycleExplanationModal";

export type RoadmapUnitStatus = "completed" | "in_cycle" | "current" | "locked";

type RoadmapUnit = {
    lesson_manager_id: string;
    title: string;
    part_type: number;
    unit_type: string;
    node_role?: string;
    target_tags?: string[];
    order: number;
    planned_minutes?: number;
    estimated_gain?: number;
    unit_source?: "strategy" | "alternative";
    source_reason?: string;

    // Optional nhưng nên có để service mock/BE future dùng.
    score_band?: {
        from?: number;
        to?: number;
    };
    prerequisite_unit_ids?: string[];
    next_unit_ids?: string[];
};

type PartRoadmap = {
    part_type: number;
    cursor_index: number;
    target_minutes?: number;
    estimated_gain?: number;
    reaches_target?: boolean;
    units: RoadmapUnit[];
};

type RoadmapCheckpointType = "entry_test" | "mini_test" | "full_test";

type RoadmapCheckpointStatus = "completed" | "current" | "planned";

type RoadmapCheckpoint = {
    id: string;
    type: RoadmapCheckpointType;
    label: string;
    cycle_no: number;
    status: RoadmapCheckpointStatus;
    test_id?: string | null;
    week_study_id?: string | null;
    day_study_id?: string | null;
    planned_score?: number | null;
    actual_score?: number | null;
    submitted_at?: string | Date | null;
};

type LearningPathRoadmapCanvasProps = {
    overview: any;
};

const activePartThemeColors = {
    color: "#2563EB",
    soft: "#EEF5FF",
    text: "#163B8F",
};

const inactivePartThemeColors = {
    color: "#64748B",
    soft: "#F8FAFC",
    text: "#475569",
    border: "rgba(148,163,184,0.18)",
};

const partTheme: Record<
    number,
    {
        color: string;
        soft: string;
        text: string;
        icon: React.ReactNode;
    }
> = {
    1: {
        ...activePartThemeColors,
        icon: <ImageOutlinedIcon fontSize="small" />,
    },
    2: {
        ...activePartThemeColors,
        icon: <HeadphonesOutlinedIcon fontSize="small" />,
    },
    3: {
        ...activePartThemeColors,
        icon: <ChatBubbleOutlineIcon fontSize="small" />,
    },
    4: {
        ...activePartThemeColors,
        icon: <FormatListBulletedIcon fontSize="small" />,
    },
    5: {
        ...activePartThemeColors,
        icon: <ArticleOutlinedIcon fontSize="small" />,
    },
    6: {
        ...activePartThemeColors,
        icon: <AutoStoriesOutlinedIcon fontSize="small" />,
    },
    7: {
        ...activePartThemeColors,
        icon: <MenuBookOutlinedIcon fontSize="small" />,
    },
};

const fallbackTheme = {
    ...activePartThemeColors,
    icon: <MapOutlinedIcon fontSize="small" />,
};

const roadmapTextSx = {
    title: { fontSize: 20, fontWeight: 800 },
    label: { fontSize: 14, fontWeight: 700 },
    caption: { fontSize: 12, fontWeight: 600 },
    helper: { fontSize: 12, fontWeight: 500 },
};

const ROADMAP_STATUS_COLORS = {
    completed: {
        main: "#10B981",
        soft: "rgba(16,185,129,0.12)",
        ring: "rgba(16,185,129,0.18)",
        text: "#047857",
    },
    inCycle: {
        main: "#6366F1",
        soft: "rgba(99,102,241,0.10)",
        ring: "rgba(99,102,241,0.14)",
        text: "#4338CA",
    },
    current: {
        main: "#F97316",
        soft: "rgba(249,115,22,0.14)",
        ring: "rgba(249,115,22,0.22)",
        text: "#C2410C",
    },
    locked: {
        main: "#94A3B8",
        soft: "#F8FAFC",
        ring: "rgba(148,163,184,0.16)",
        text: "#64748B",
    },
};

const roadmapLayout = {
    rowHeight: { xs: 78, sm: 82, md: 86, lg: 90, xl: 96 },
    leftColumn: {
        xs: "144px minmax(0, 1fr)",
        sm: "168px minmax(0, 1fr)",
        md: "190px minmax(0, 1fr)",
        lg: "208px minmax(0, 1fr)",
        xl: "224px minmax(0, 1fr)",
    },
    partCardWidth: { xs: 90, sm: 106, md: 122, lg: 134, xl: 144 },
    partIconSize: { xs: 26, sm: 28, md: 28, lg: 30, xl: 30 },
    progressChipMinWidth: { xs: 44, sm: 50, md: 54, lg: 58, xl: 62 },
    nodeSlot: { xs: 92, sm: 100, md: 108, lg: 118, xl: 128 },
    nodeLabel: { xs: 86, sm: 94, md: 102, lg: 110, xl: 118 },
    nodeSize: { xs: 26, sm: 26, md: 28, lg: 28, xl: 30 },
    activeNodeSize: { xs: 32, sm: 34, md: 34, lg: 36, xl: 38 },
    activeInnerSize: { xs: 16, sm: 16, md: 17, lg: 18, xl: 18 },
    lineInset: { xs: 46, sm: 50, md: 54, lg: 59, xl: 64 },
    laneMinWidth: { xs: 520, sm: 580, md: 640, lg: 720, xl: 800 },
    lanePaddingY: { xs: 2.8, sm: 3, md: 3.1, lg: 3.3, xl: 3.4 },
    canvasMarginX: { xs: 1, sm: 1.25, md: 1.75, lg: 2.25, xl: 2.5 },
    headerPaddingX: { xs: 1.5, sm: 2, md: 2.4, lg: 2.8, xl: 3 },
    buttonHeight: { xs: 36, sm: 38, md: 40, lg: 42, xl: 42 },
};

type ResponsiveNumber = {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
};

const buildResponsiveLaneWidth = (unitCount: number): ResponsiveNumber => ({
    xs: Math.max(roadmapLayout.laneMinWidth.xs, unitCount * roadmapLayout.nodeSlot.xs),
    sm: Math.max(roadmapLayout.laneMinWidth.sm, unitCount * roadmapLayout.nodeSlot.sm),
    md: Math.max(roadmapLayout.laneMinWidth.md, unitCount * roadmapLayout.nodeSlot.md),
    lg: Math.max(roadmapLayout.laneMinWidth.lg, unitCount * roadmapLayout.nodeSlot.lg),
    xl: Math.max(roadmapLayout.laneMinWidth.xl, unitCount * roadmapLayout.nodeSlot.xl),
});

const buildResponsiveNodeSpanWidth = (spanCount: number) =>
    spanCount <= 0
        ? 0
        : {
            xs: spanCount * roadmapLayout.nodeSlot.xs,
            sm: spanCount * roadmapLayout.nodeSlot.sm,
            md: spanCount * roadmapLayout.nodeSlot.md,
            lg: spanCount * roadmapLayout.nodeSlot.lg,
            xl: spanCount * roadmapLayout.nodeSlot.xl,
        };

const getPartTheme = (partType: number) => partTheme[partType] ?? fallbackTheme;

const stripPartPrefix = (tag: string) =>
    tag.replace(/^\[Part\s*\d+\]\s*/i, "").trim();

const capitalizeFirstLetter = (value: string) => {
    const label = value.trim();
    if (!label) return label;

    return `${label.charAt(0).toLocaleUpperCase("vi-VN")}${label.slice(1)}`;
};

const shortenUnitLabel = (unit: RoadmapUnit) => {
    const firstTag = unit.target_tags?.[0];
    if (firstTag) {
        const cleanTag = stripPartPrefix(firstTag);

        return capitalizeFirstLetter(
            cleanTag
                .replace("Câu hỏi về ", "")
                .replace("Câu hỏi ", "")
                .replace("Dạng bài: ", "")
                .replace("Hình thức: ", "")
                .replace(/\s*\(.+\)\s*/g, "")
                .split(" - ")[0]
                .split(" – ")[0]
                .trim()
        );
    }

    if (unit.unit_type === "foundation") return capitalizeFirstLetter("Nền tảng");
    if (unit.unit_type === "remedial") return capitalizeFirstLetter("Chữa hổng");
    if (unit.unit_type === "skill_drill") return capitalizeFirstLetter("Luyện tập");

    return capitalizeFirstLetter("Bài học");
};

const buildRoadmapCanvasStatusMap = (overview: any) => {
    const units = overview?.roadmap_canvas?.units ?? [];

    return new Map<string, RoadmapUnitStatus>(
        units
            .filter((item: any) => item?.lesson_manager_id && item?.status)
            .map((item: any) => [
                String(item.lesson_manager_id),
                item.status as RoadmapUnitStatus,
            ])
    );
};

const countCompletedUnitsInRoadmap = (
    roadmap: PartRoadmap,
    statusByLessonManagerId: Map<string, RoadmapUnitStatus>
): number => {
    return (roadmap.units ?? []).filter((unit) => {
        const status = statusByLessonManagerId.get(String(unit.lesson_manager_id));
        return status === "completed";
    }).length;
};

function RoadmapNode({
    unit,
    status,
    color,
    onClick
}: {
    unit: RoadmapUnit;
    status: RoadmapUnitStatus;
    color: string;
    onClick?: () => void
}) {
    const isCompleted = status === "completed";
    const isInCycle = status === "in_cycle";
    const isLocked = status === "locked";
    const isCurrent = status === "current";
    const label = shortenUnitLabel(unit);
    const isAlternative = unit.unit_source === "alternative";

    return (
        <Box
            sx={{
                position: "relative",
                minWidth: roadmapLayout.nodeSlot,
                flex: {
                    xs: `0 0 ${roadmapLayout.nodeSlot.xs}px`,
                    sm: `0 0 ${roadmapLayout.nodeSlot.sm}px`,
                    md: `0 0 ${roadmapLayout.nodeSlot.md}px`,
                    lg: `0 0 ${roadmapLayout.nodeSlot.lg}px`,
                    xl: `0 0 ${roadmapLayout.nodeSlot.xl}px`,
                },
                height: roadmapLayout.activeNodeSize,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
            }}
        >
            {isCurrent && (
                <Chip
                    label={"Đang học"}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: { xs: -30, sm: -31, md: -32, lg: -33, xl: -34 },
                        height: 24,
                        borderRadius: 999,
                        ...roadmapTextSx.caption,
                        color: "#FFFFFF",
                        bgcolor: ROADMAP_STATUS_COLORS.current.main,
                        boxShadow: `0 8px 18px ${ROADMAP_STATUS_COLORS.current.ring}`,
                        "& .MuiChip-label": { px: 1.1 },
                    }}
                />
            )}

            {isAlternative && !isCurrent && (
                <Tooltip title="Main graph của Part này đã hết, hệ thống chọn bài cùng Part và gần năng lực hiện tại.">
                    <Chip
                        label="Bài thay thế"
                        size="small"
                        sx={{
                            position: "absolute",
                            top: { xs: -30, sm: -31, md: -32, lg: -33, xl: -34 },
                            height: 24,
                            borderRadius: 999,
                            ...roadmapTextSx.caption,
                            color: "#8A4B00",
                            bgcolor: "#FFF4DE",
                            border: "1px solid rgba(245,158,11,0.32)",
                            boxShadow: "0 8px 18px rgba(245,158,11,0.14)",
                            "& .MuiChip-label": { px: 1.1 },
                        }}
                    />
                </Tooltip>
            )}

            <Box
                onClick={onClick}
                sx={{
                    width: isCurrent ? roadmapLayout.activeNodeSize : roadmapLayout.nodeSize,
                    height: isCurrent ? roadmapLayout.activeNodeSize : roadmapLayout.nodeSize,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    position: "relative",
                    zIndex: 2,
                    cursor: "pointer",
                    bgcolor: isCompleted
                        ? ROADMAP_STATUS_COLORS.completed.main
                        : isCurrent
                            ? "#FFFFFF"
                            : isInCycle
                                ? "#FFFFFF"
                                : "#FFFFFF",

                    color: isCompleted ? "#FFFFFF" : color,

                    border: isLocked
                        ? `2px solid ${ROADMAP_STATUS_COLORS.locked.main}`
                        : isCurrent
                            ? `3px solid ${ROADMAP_STATUS_COLORS.current.main}`
                            : isInCycle
                                ? `3px solid ${ROADMAP_STATUS_COLORS.inCycle.main}`
                                : `1px solid gray`,

                    boxShadow: isCurrent
                        ? `0 0 0 2px ${ROADMAP_STATUS_COLORS.current.soft}, 0 0 0 8px ${ROADMAP_STATUS_COLORS.current.ring}, 0 10px 22px ${ROADMAP_STATUS_COLORS.current.ring}`
                        : isInCycle
                            ? "none"
                            : isCompleted
                                ? `0 6px 14px ${ROADMAP_STATUS_COLORS.completed.ring}`
                                : "0 4px 10px rgba(15,23,42,0.05)",
                    opacity: isLocked ? 0.72 : 1,
                    transition: "transform .15s ease, box-shadow .15s ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                    },
                }}
            >
                {isCompleted ? (
                    <CheckIcon sx={{ fontSize: 14 }} />
                ) : isCurrent ? (
                    <Box
                        sx={{
                            width: roadmapLayout.activeInnerSize,
                            height: roadmapLayout.activeInnerSize,
                            borderRadius: "50%",
                            bgcolor: ROADMAP_STATUS_COLORS.current.main,
                            boxShadow: `inset 0 0 0 4px ${ROADMAP_STATUS_COLORS.current.soft}`,
                        }}
                    />
                ) : isInCycle ? (
                    <Box
                        sx={{
                            width: { xs: 12, sm: 12, md: 13, lg: 14, xl: 14 },
                            height: { xs: 12, sm: 12, md: 13, lg: 14, xl: 14 },
                            borderRadius: "50%",
                            bgcolor: "transparent",
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "transparent",
                        }}
                    />
                )}
            </Box>

            <Typography
                variant="caption"
                title={label}
                sx={{
                    position: "absolute",
                    top: { xs: 36, sm: 37, md: 38, lg: 40, xl: 42 },
                    width: roadmapLayout.nodeLabel,
                    textAlign: "center",
                    color: isLocked ? ROADMAP_STATUS_COLORS.locked.text : "#0F1F4B",
                    ...roadmapTextSx.caption,
                    fontWeight: isCurrent ? 800 : roadmapTextSx.caption.fontWeight,
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

function RoadmapPartSummary({
    roadmap,
    statusByLessonManagerId,
}: {
    roadmap: PartRoadmap;
    statusByLessonManagerId: Map<string, RoadmapUnitStatus>;
}) {
    const theme = getPartTheme(roadmap.part_type);
    const units = roadmap.units ?? [];
    const completedCount = countCompletedUnitsInRoadmap(
        roadmap,
        statusByLessonManagerId
    );
    const hasInCycle = units.some((unit) => {
        const status = statusByLessonManagerId.get(String(unit.lesson_manager_id));
        return status === "in_cycle" || status === "current";
    });
    const summaryColors = hasInCycle ? activePartThemeColors : inactivePartThemeColors;

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
                minHeight: roadmapLayout.rowHeight,
                pr: { xs: 0.75, sm: 1, md: 1.25, lg: 1.5, xl: 1.5 },
                pl: { xs: 0.75, sm: 1, md: 1.25, lg: 1.5, xl: 1.5 },
                borderBottom: "1px solid rgba(148,163,184,0.16)",
                bgcolor: "rgba(255,255,255,0.92)",
            }}
        >
            <Box
                sx={{
                    width: roadmapLayout.partCardWidth,
                    height: { xs: 44, sm: 46, md: 48, lg: 50, xl: 52 },
                    px: { xs: 0.9, sm: 1.0, md: 1.15, lg: 1.3, xl: 1.4 },
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 0.8, sm: 0.9, md: 1, lg: 1.1, xl: 1.2 },
                    bgcolor: summaryColors.soft,
                    border: `1px solid ${hasInCycle ? `${summaryColors.color}33` : inactivePartThemeColors.border
                        }`,
                    boxShadow: hasInCycle ? `0 8px 18px ${summaryColors.color}14` : "none",
                }}
            >
                <Box
                    sx={{
                        width: roadmapLayout.partIconSize,
                        height: roadmapLayout.partIconSize,
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
                        ...roadmapTextSx.label,
                        color: summaryColors.text,
                    }}
                >
                    Part {roadmap.part_type}
                </Typography>
            </Box>

            <Chip
                label={units.length > 0 ? `${completedCount}/${units.length}` : "0 bài"}
                size="small"
                sx={{
                    height: 32,
                    minWidth: roadmapLayout.progressChipMinWidth,
                    borderRadius: 999,
                    ...roadmapTextSx.label,
                    color: summaryColors.color,
                    bgcolor: summaryColors.soft,
                    border: `1px solid ${hasInCycle ? `${summaryColors.color}16` : inactivePartThemeColors.border
                        }`,
                }}
            />
        </Stack>
    );
}

function RoadmapLane({
    roadmap,
    statusByLessonManagerId,
    laneContentWidth,
    onOpenNodeDetail,
}: {
    roadmap: PartRoadmap;
    statusByLessonManagerId: Map<string, RoadmapUnitStatus>;
    laneContentWidth: ResponsiveNumber;
    onOpenNodeDetail: (unit: RoadmapUnit, status: RoadmapUnitStatus) => void;
}) {
    const theme = getPartTheme(roadmap.part_type);
    const units = roadmap.units ?? [];
    const completedCount = countCompletedUnitsInRoadmap(
        roadmap,
        statusByLessonManagerId
    );

    const trackSpanCount = Math.max(0, units.length - 1);
    const completedSpanCount =
        completedCount > 0
            ? Math.max(0, Math.min(completedCount, units.length) - 1)
            : 0;

    return (
        <Box
            sx={{
                minWidth: laneContentWidth,
                minHeight: roadmapLayout.rowHeight,
                borderBottom: "1px solid rgba(148,163,184,0.16)",
            }}
        >

            <Box
                sx={{
                    position: "relative",
                    overflow: "visible",
                    py: roadmapLayout.lanePaddingY,
                    pr: { xs: 1, sm: 1.25, md: 1.5, lg: 1.75, xl: 2 },
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        left: roadmapLayout.lineInset,
                        top: "50%",
                        width: buildResponsiveNodeSpanWidth(trackSpanCount),
                        height: 2,
                        bgcolor: "rgba(148,163,184,0.28)",
                        transform: "translateY(-50%)",
                        zIndex: 0,
                    }}
                />

                <Box
                    sx={{
                        position: "absolute",
                        left: roadmapLayout.lineInset,
                        top: "50%",
                        width: buildResponsiveNodeSpanWidth(completedSpanCount),
                        height: 3,
                        bgcolor: ROADMAP_STATUS_COLORS.completed.main,
                        transform: "translateY(-50%)",
                        borderRadius: 999,
                        zIndex: 1,
                    }}
                />

                <Stack direction="row" alignItems="center" sx={{ position: "relative", zIndex: 2 }}>
                    {units.map((unit) => {
                        const status =
                            statusByLessonManagerId.get(String(unit.lesson_manager_id)) ?? "locked";

                        return (
                            <RoadmapNode
                                key={unit.lesson_manager_id}
                                unit={unit}
                                status={status}
                                color={theme.color}
                                onClick={() => onOpenNodeDetail(unit, status)}
                            />
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
}

const checkpointStatusMeta: Record<
    RoadmapCheckpointStatus,
    { label: string; color: string; soft: string; border: string }
> = {
    completed: {
        label: "Đã xong",
        color: "#047857",
        soft: "rgba(16,185,129,0.12)",
        border: "rgba(16,185,129,0.28)",
    },
    current: {
        label: "Đang mở",
        color: "#C2410C",
        soft: "rgba(249,115,22,0.14)",
        border: "rgba(249,115,22,0.32)",
    },
    planned: {
        label: "Dự kiến",
        color: "#475569",
        soft: "#F8FAFC",
        border: "rgba(148,163,184,0.24)",
    },
};

const getCheckpointIcon = (type: RoadmapCheckpointType) => {
    if (type === "entry_test") return <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />;
    if (type === "mini_test") return <QuizOutlinedIcon sx={{ fontSize: 18 }} />;
    return <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />;
};

const getCheckpointHelper = (checkpoint: RoadmapCheckpoint) => {
    if (checkpoint.type === "entry_test") return "Mốc năng lực đầu vào";
    if (checkpoint.type === "mini_test") return `Cuối Cycle ${checkpoint.cycle_no}`;
    return `Full Test Cycle ${checkpoint.cycle_no}`;
};

const formatCheckpointScore = (score?: number | null) =>
    typeof score === "number" && Number.isFinite(score)
        ? `${Math.round(score)} TOEIC`
        : null;

const formatActualCheckpointScore = (checkpoint: RoadmapCheckpoint) => {
    if (
        typeof checkpoint.actual_score !== "number" ||
        !Number.isFinite(checkpoint.actual_score)
    ) {
        return null;
    }

    if (checkpoint.type === "mini_test") {
        return `${Math.round(checkpoint.actual_score)} điểm`;
    }

    return `${Math.round(checkpoint.actual_score)} TOEIC`;
};

const shouldShowPlannedToeicScore = (checkpoint: RoadmapCheckpoint) =>
    checkpoint.type === "full_test";

function RoadmapCheckpointRail({
    checkpoints,
}: {
    checkpoints: RoadmapCheckpoint[];
}) {
    if (checkpoints.length === 0) return null;

    return (
        <Box
            sx={{
                mx: roadmapLayout.canvasMarginX,
                mb: 1.1,
                px: { xs: 1.2, sm: 1.4, md: 1.6, lg: 1.8, xl: 2 },
                py: { xs: 1.2, sm: 1.35, md: 1.45, lg: 1.55, xl: 1.65 },
                borderRadius: 2.5,
                border: "1px solid rgba(148,163,184,0.18)",
                bgcolor: "rgba(248,250,252,0.72)",
            }}
        >
            <Stack spacing={1.1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography sx={{ ...roadmapTextSx.label, color: "#0F1F4B" }}>
                        Checkpoint đánh giá
                    </Typography>
                    <Typography sx={{ ...roadmapTextSx.helper, color: "#64748B" }}>
                        Entry Test, Mini Test và Full Test trong lộ trình
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        overflowX: "auto",
                        pb: 0.5,
                        "&::-webkit-scrollbar": { height: 6 },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(100,116,139,0.22)",
                            borderRadius: 999,
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="stretch"
                        spacing={1.1}
                        sx={{ minWidth: "max-content" }}
                    >
                        {checkpoints.map((checkpoint, index) => {
                            const statusMeta = checkpointStatusMeta[checkpoint.status];
                            const actualScore = formatActualCheckpointScore(checkpoint);
                            const plannedScore = shouldShowPlannedToeicScore(checkpoint)
                                ? formatCheckpointScore(checkpoint.planned_score)
                                : null;

                            return (
                                <React.Fragment key={checkpoint.id}>
                                    {index > 0 && (
                                        <Box
                                            sx={{
                                                alignSelf: "center",
                                                width: 34,
                                                height: 2,
                                                bgcolor: "rgba(148,163,184,0.28)",
                                                borderRadius: 999,
                                            }}
                                        />
                                    )}

                                    <Box
                                        sx={{
                                            minWidth: { xs: 154, sm: 166, md: 178 },
                                            px: 1.15,
                                            py: 1,
                                            borderRadius: 2,
                                            border: `1px solid ${statusMeta.border}`,
                                            bgcolor: "#FFFFFF",
                                            boxShadow:
                                                checkpoint.status === "current"
                                                    ? "0 10px 22px rgba(249,115,22,0.12)"
                                                    : "0 6px 16px rgba(15,23,42,0.04)",
                                        }}
                                    >
                                        <Stack spacing={0.8}>
                                            <Stack direction="row" alignItems="center" spacing={0.8}>
                                                <Box
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: "50%",
                                                        display: "grid",
                                                        placeItems: "center",
                                                        color: statusMeta.color,
                                                        bgcolor: statusMeta.soft,
                                                        border: `1px solid ${statusMeta.border}`,
                                                    }}
                                                >
                                                    {getCheckpointIcon(checkpoint.type)}
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        title={checkpoint.label}
                                                        sx={{
                                                            ...roadmapTextSx.label,
                                                            color: "#172554",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {checkpoint.label}
                                                    </Typography>
                                                    <Typography sx={{ ...roadmapTextSx.helper, color: "#64748B" }}>
                                                        {getCheckpointHelper(checkpoint)}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                                                <Chip
                                                    label={statusMeta.label}
                                                    size="small"
                                                    sx={{
                                                        height: 24,
                                                        borderRadius: 999,
                                                        color: statusMeta.color,
                                                        bgcolor: statusMeta.soft,
                                                        border: `1px solid ${statusMeta.border}`,
                                                        ...roadmapTextSx.caption,
                                                    }}
                                                />
                                                {actualScore && (
                                                    <Chip
                                                        label={actualScore}
                                                        size="small"
                                                        sx={{
                                                            height: 24,
                                                            borderRadius: 999,
                                                            color: "#2563EB",
                                                            bgcolor: "#EEF5FF",
                                                            ...roadmapTextSx.caption,
                                                        }}
                                                    />
                                                )}
                                                {!actualScore && plannedScore && (
                                                    <Chip
                                                        label={`Dự kiến ${plannedScore}`}
                                                        size="small"
                                                        sx={{
                                                            height: 24,
                                                            borderRadius: 999,
                                                            color: "#475569",
                                                            bgcolor: "#F8FAFC",
                                                            border: "1px solid rgba(148,163,184,0.2)",
                                                            ...roadmapTextSx.caption,
                                                        }}
                                                    />
                                                )}
                                                {!actualScore && !plannedScore && checkpoint.type === "mini_test" && (
                                                    <Chip
                                                        label="Đo focus skill"
                                                        size="small"
                                                        sx={{
                                                            height: 24,
                                                            borderRadius: 999,
                                                            color: "#475569",
                                                            bgcolor: "#F8FAFC",
                                                            border: "1px solid rgba(148,163,184,0.2)",
                                                            ...roadmapTextSx.caption,
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </React.Fragment>
                            );
                        })}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}

function CanvasLegend() {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.2, sm: 1.6, md: 2, lg: 2.3, xl: 2.5 }}
            flexWrap="wrap"
            sx={{
                px: roadmapLayout.headerPaddingX,
                py: { xs: 1.1, sm: 1.25, md: 1.4, lg: 1.5, xl: 1.6 },
                borderTop: "1px solid rgba(148,163,184,0.18)",
                bgcolor: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
            }}
        >
            <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                    sx={{
                        width: roadmapLayout.nodeSize,
                        height: roadmapLayout.nodeSize,
                        borderRadius: "50%",
                        bgcolor: ROADMAP_STATUS_COLORS.completed.main,
                        display: "grid",
                        placeItems: "center",
                        color: "#FFFFFF",
                    }}
                >
                    <CheckIcon sx={{ fontSize: 14 }} />
                </Box>
                <Typography variant="body2" sx={{ ...roadmapTextSx.label, color: "#0F1F4B" }}>
                    Đã học
                </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                    sx={{
                        width: { xs: 18, sm: 18, md: 19, lg: 20, xl: 20 },
                        height: { xs: 18, sm: 18, md: 19, lg: 20, xl: 20 },
                        borderRadius: "50%",
                        bgcolor: "#FFFFFF",
                        border: `3px solid ${ROADMAP_STATUS_COLORS.inCycle.main}`,
                    }}
                />
                <Typography variant="body2" sx={{ ...roadmapTextSx.label, color: "#0F1F4B" }}>
                    Trong cycle
                </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                    sx={{
                        width: { xs: 20, sm: 20, md: 21, lg: 22, xl: 22 },
                        height: { xs: 20, sm: 20, md: 21, lg: 22, xl: 22 },
                        borderRadius: "50%",
                        bgcolor: "#FFFFFF",
                        border: `3px solid ${ROADMAP_STATUS_COLORS.current.main}`,
                        boxShadow: `0 0 0 4px ${ROADMAP_STATUS_COLORS.current.ring}`,
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: ROADMAP_STATUS_COLORS.current.main,
                        }}
                    />
                </Box>
                <Typography variant="body2" sx={{ ...roadmapTextSx.label, color: "#0F1F4B" }}>
                    Đang học
                </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.8}>
                <Box
                    sx={{
                        width: { xs: 18, sm: 18, md: 19, lg: 20, xl: 20 },
                        height: { xs: 18, sm: 18, md: 19, lg: 20, xl: 20 },
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: ROADMAP_STATUS_COLORS.locked.soft,
                        border: `1px solid ${ROADMAP_STATUS_COLORS.locked.main}`,
                    }}
                >
                </Box>
                <Typography variant="body2" sx={{ ...roadmapTextSx.label, color: "#0F1F4B" }}>
                    Dự kiến
                </Typography>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

            <Typography
                variant="body2"
                sx={{
                    ...roadmapTextSx.helper,
                    color: "#21305F",
                    flex: 1,
                    minWidth: 260,
                }}
            >
                Các node ngoài cycle là lộ trình dự kiến. Hệ thống sẽ tối ưu lại thứ tự hoặc thêm bài bổ trợ khi năng lực của bạn thay đổi.
            </Typography>
        </Stack>
    );
}

export default function LearningPathRoadmapCanvas({
    overview,
}: LearningPathRoadmapCanvasProps) {
    const partRoadmaps: PartRoadmap[] =
        overview?.roadmap_canvas?.part_roadmaps ?? [];
    const checkpoints: RoadmapCheckpoint[] =
        overview?.roadmap_canvas?.checkpoints ?? [];

    const learningPathId = overview?.learning_path?._id;
    const statusByLessonManagerId = React.useMemo(
        () => buildRoadmapCanvasStatusMap(overview),
        [overview]
    );

    const sortedRoadmaps = React.useMemo(
        () => [...partRoadmaps].sort((a, b) => a.part_type - b.part_type),
        [partRoadmaps]
    );
    const laneContentWidth = React.useMemo(
        () => buildResponsiveLaneWidth(
            Math.max(0, ...sortedRoadmaps.map((roadmap) => roadmap.units?.length ?? 0))
        ),
        [sortedRoadmaps]
    );

    const [nodeDetailModal, setNodeDetailModal] = React.useState<{
        open: boolean;
        loading: boolean;
        errorMessage: string | null;
        detail: LearningPathNodeDetailResponse | null;
    }>({
        open: false,
        loading: false,
        errorMessage: null,
        detail: null,
    });

    const handleOpenNodeDetail = React.useCallback(
        async (unit: RoadmapUnit, status: RoadmapUnitStatus) => {
            console.log(overview);

            setNodeDetailModal({
                open: true,
                loading: true,
                errorMessage: null,
                detail: null,
            });

            try {
                if (!learningPathId) {
                    throw new Error("Không tìm thấy learningPathId để lấy chi tiết bài học.");
                }

                const response = await learningPathV2Service.getNodeDetail(
                    learningPathId,
                    String(unit.lesson_manager_id),
                    {
                        unit,
                        status,
                        overview,
                    }
                );

                setNodeDetailModal({
                    open: true,
                    loading: false,
                    errorMessage: null,
                    detail: response.data,
                });
            } catch (error) {
                console.error("Get node detail failed:", error);

                setNodeDetailModal({
                    open: true,
                    loading: false,
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : "Không thể tải chi tiết bài học.",
                    detail: null,
                });
            }
        },
        [overview]
    );

    const handleCloseNodeDetail = React.useCallback(() => {
        setNodeDetailModal((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    const [skillMapOpen, setSkillMapOpen] = React.useState(false);
    const [cycleExplanationModal, setCycleExplanationModal] = React.useState<{
        open: boolean;
        loading: boolean;
        errorMessage: string | null;
        data: LearningPathCycleExplanationResponse | null;
    }>({
        open: false,
        loading: false,
        errorMessage: null,
        data: null,
    });

    const handleOpenCycleExplanation = React.useCallback(async () => {
        setCycleExplanationModal({
            open: true,
            loading: true,
            errorMessage: null,
            data: null,
        });

        try {
            if (!learningPathId) {
                throw new Error("Không tìm thấy learningPathId để lấy giải thích cycle.");
            }

            const response = await learningPathV2Service.getCurrentCycleExplanation(
                learningPathId
            );
            const payload = unwrapCycleExplanationPayload(response);

            setCycleExplanationModal({
                open: true,
                loading: false,
                errorMessage: null,
                data: payload,
            });
        } catch (error) {
            setCycleExplanationModal({
                open: true,
                loading: false,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải giải thích cycle hiện tại.",
                data: null,
            });
        }
    }, [learningPathId]);

    const handleCloseCycleExplanation = React.useCallback(() => {
        setCycleExplanationModal((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    return (
        <Paper
            variant="outlined"
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: { xs: 2.5, sm: 3, md: 3.25, lg: 3.5, xl: 4 },
                borderColor: "rgba(148,163,184,0.22)",
                bgcolor: "#FFFFFF",
                boxShadow: "0 18px 46px rgba(15,23,42,0.08)",
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{
                        px: roadmapLayout.headerPaddingX,
                        pt: { xs: 1.5, sm: 1.8, md: 2.1, lg: 2.4, xl: 2.6 },
                        pb: { xs: 1.2, sm: 1.4, md: 1.5, lg: 1.7, xl: 1.8 },
                    }}
                >
                    <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={{ xs: 0.8, sm: 1 }}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <AutoAwesomeIcon
                                sx={{
                                    color: "#6D8CFF",
                                    fontSize: 20,
                                    flex: "0 0 auto",
                                }}
                            />

                            <Typography
                                variant="h5"
                                sx={{
                                    ...roadmapTextSx.title,
                                    color: "#172554",
                                    lineHeight: 1.2,
                                }}
                            >
                                Bản đồ học tập thích ứng
                            </Typography>

                            <Tooltip title="Lộ trình sẽ được cập nhật lại sau mỗi Mini Test hoặc Full Test.">
                                <Chip
                                    icon={<InfoOutlinedIcon />}
                                    label="Cập nhật sau Mini Test / Full Test"
                                    size="small"
                                    sx={{
                                        height: 26,
                                        borderRadius: 999,
                                        bgcolor: "#EEF5FF",
                                        border: "1px solid rgba(37,99,235,0.14)",
                                        color: "#2563EB",
                                        ...roadmapTextSx.caption,
                                        "& .MuiChip-icon": {
                                            color: "#2563EB",
                                            fontSize: "15px !important",
                                            ml: 0.75,
                                        },
                                        "& .MuiChip-label": {
                                            px: 0.9,
                                        },
                                    }}
                                />
                            </Tooltip>
                        </Stack>

                        <Typography
                            sx={{
                                ...roadmapTextSx.helper,
                                color: "#64748B",
                                lineHeight: 1.45,
                            }}
                        >
                            Lộ trình này là dự kiến theo chiến lược hiện tại và sẽ được tối ưu lại sau mỗi Mini Test / Full Test.
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={{ xs: 0.8, sm: 0.9, md: 1, lg: 1.1, xl: 1.2 }}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ justifyContent: { xs: "flex-start", md: "flex-end" } }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<MapOutlinedIcon />}
                            onClick={() => setSkillMapOpen(true)}
                            sx={actionButtonSx}
                        >
                            Skill Map
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LightbulbOutlinedIcon />}
                            onClick={handleOpenCycleExplanation}
                            sx={actionButtonSx}
                        >
                            Vì sao?
                        </Button>
                    </Stack>
                </Stack>

                <RoadmapCheckpointRail checkpoints={checkpoints} />

                <Box
                    sx={{
                        mx: roadmapLayout.canvasMarginX,
                        mb: 0.5,
                        borderRadius: 3,
                        border: "1px solid rgba(148,163,184,0.14)",
                        overflow: "hidden",
                        bgcolor: "rgba(255,255,255,0.58)",
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: roadmapLayout.leftColumn,
                            gap: "15px"
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                zIndex: 2,
                                bgcolor: "rgba(255,255,255,0.92)",
                                boxShadow: "8px 0 18px rgba(15,23,42,0.04)",
                            }}
                        >
                            {sortedRoadmaps.map((roadmap) => (
                                <RoadmapPartSummary
                                    key={roadmap.part_type}
                                    roadmap={roadmap}
                                    statusByLessonManagerId={statusByLessonManagerId}
                                />
                            ))}
                        </Box>

                        <Box
                            sx={{
                                minWidth: 0,
                                overflowX: "auto",
                                "&::-webkit-scrollbar": { height: 8 },
                                "&::-webkit-scrollbar-thumb": {
                                    bgcolor: "rgba(100,116,139,0.24)",
                                    borderRadius: 999,
                                },
                                "&::-webkit-scrollbar-track": {
                                    bgcolor: "rgba(148,163,184,0.12)",
                                    borderRadius: 999,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: laneContentWidth,
                                }}
                            >
                                {sortedRoadmaps.map((roadmap) => (
                                    <RoadmapLane
                                        key={roadmap.part_type}
                                        roadmap={roadmap}
                                        statusByLessonManagerId={statusByLessonManagerId}
                                        laneContentWidth={laneContentWidth}
                                        onOpenNodeDetail={handleOpenNodeDetail}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <CanvasLegend />
            </Box>

            <LearningPathNodeDetailModal
                open={nodeDetailModal.open}
                detail={nodeDetailModal.detail}
                loading={nodeDetailModal.loading}
                errorMessage={nodeDetailModal.errorMessage}
                onClose={handleCloseNodeDetail}
                onPrimaryAction={() => {
                    console.log("Node detail primary action:", nodeDetailModal.detail);
                }}
            />

            <LearningPathSkillMapModal
                open={skillMapOpen}
                learningPathId={learningPathId}
                onClose={() => setSkillMapOpen(false)}
            />

            <LearningPathCycleExplanationModal
                open={cycleExplanationModal.open}
                data={cycleExplanationModal.data}
                loading={cycleExplanationModal.loading}
                errorMessage={cycleExplanationModal.errorMessage}
                onClose={handleCloseCycleExplanation}
            />

        </Paper>
    );
}

const actionButtonSx = {
    height: roadmapLayout.buttonHeight,
    px: { xs: 1.15, sm: 1.25, md: 1.45, lg: 1.65, xl: 1.8 },
    borderRadius: 2,
    textTransform: "none",
    fontSize: 14,
    fontWeight: 700,
    color: "#0F2A74",
    borderColor: "rgba(37,99,235,0.35)",
    bgcolor: "rgba(255,255,255,0.72)",
    boxShadow: "0 6px 18px rgba(37,99,235,0.06)",
    "&:hover": {
        borderColor: "rgba(37,99,235,0.7)",
        bgcolor: "rgba(239,246,255,0.9)",
    },
};
