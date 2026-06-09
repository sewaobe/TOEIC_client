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
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CheckIcon from "@mui/icons-material/Check";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

type RoadmapUnitStatus = "completed" | "in_cycle" | "current" | "locked";

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
};

type PartRoadmap = {
    part_type: number;
    cursor_index: number;
    target_minutes?: number;
    estimated_gain?: number;
    reaches_target?: boolean;
    units: RoadmapUnit[];
};

type LearningPathRoadmapCanvasProps = {
    overview: any;
    onOpenSkillMap?: () => void;
    onOpenStrategy?: () => void;
    onOpenReason?: () => void;
    onOpenCycleDetail?: () => void;
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
        color: "#2563EB",
        soft: "#EEF5FF",
        text: "#163B8F",
        icon: <ImageOutlinedIcon fontSize="small" />,
    },
    2: {
        color: "#16A34A",
        soft: "#ECFDF3",
        text: "#126B37",
        icon: <HeadphonesOutlinedIcon fontSize="small" />,
    },
    3: {
        color: "#F59E0B",
        soft: "#FFF7E8",
        text: "#9A5B00",
        icon: <ChatBubbleOutlineIcon fontSize="small" />,
    },
    4: {
        color: "#6D5DF6",
        soft: "#F1EFFF",
        text: "#4338CA",
        icon: <FormatListBulletedIcon fontSize="small" />,
    },
    5: {
        color: "#06A6B7",
        soft: "#EAFBFD",
        text: "#087887",
        icon: <ArticleOutlinedIcon fontSize="small" />,
    },
    6: {
        color: "#6C3CF0",
        soft: "#F3EEFF",
        text: "#4C1D95",
        icon: <AutoStoriesOutlinedIcon fontSize="small" />,
    },
    7: {
        color: "#7048E8",
        soft: "#F2EDFF",
        text: "#4C1D95",
        icon: <MenuBookOutlinedIcon fontSize="small" />,
    },
};

const fallbackTheme = {
    color: "#2563EB",
    soft: "#EEF5FF",
    text: "#163B8F",
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
    partCardWidth: { xs: 96, sm: 112, md: 128, lg: 140, xl: 150 },
    partIconSize: { xs: 28, sm: 30, md: 30, lg: 32, xl: 32 },
    progressChipMinWidth: { xs: 42, sm: 48, md: 52, lg: 56, xl: 60 },
    nodeSlot: { xs: 92, sm: 100, md: 108, lg: 118, xl: 128 },
    nodeLabel: { xs: 86, sm: 94, md: 102, lg: 110, xl: 118 },
    nodeSize: { xs: 28, sm: 28, md: 30, lg: 30, xl: 32 },
    activeNodeSize: { xs: 34, sm: 36, md: 36, lg: 38, xl: 40 },
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

const buildResponsiveProgressWidth = (progressPercent: number) =>
    progressPercent <= 0
        ? 0
        : {
            xs: `calc(${progressPercent}% - ${roadmapLayout.lineInset.xs}px)`,
            sm: `calc(${progressPercent}% - ${roadmapLayout.lineInset.sm}px)`,
            md: `calc(${progressPercent}% - ${roadmapLayout.lineInset.md}px)`,
            lg: `calc(${progressPercent}% - ${roadmapLayout.lineInset.lg}px)`,
            xl: `calc(${progressPercent}% - ${roadmapLayout.lineInset.xl}px)`,
        };

const responsiveTrackMaxWidth = {
    xs: `calc(100% - ${roadmapLayout.lineInset.xs * 2}px)`,
    sm: `calc(100% - ${roadmapLayout.lineInset.sm * 2}px)`,
    md: `calc(100% - ${roadmapLayout.lineInset.md * 2}px)`,
    lg: `calc(100% - ${roadmapLayout.lineInset.lg * 2}px)`,
    xl: `calc(100% - ${roadmapLayout.lineInset.xl * 2}px)`,
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
}: {
    unit: RoadmapUnit;
    status: RoadmapUnitStatus;
    color: string;
}) {
    const isCompleted = status === "completed";
    const isInCycle = status === "in_cycle";
    const isLocked = status === "locked";
    const isCurrent = status === "current";
    const label = shortenUnitLabel(unit);

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

            <Box
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
                                : `2px solid ${color}`,

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
                {isLocked ? (
                    <LockOutlinedIcon sx={{ fontSize: 14, color: ROADMAP_STATUS_COLORS.locked.text }} />
                ) : isCompleted ? (
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
                    top: { xs: 34, sm: 35, md: 36, lg: 38, xl: 40 },
                    width: roadmapLayout.nodeLabel,
                    textAlign: "center",
                    color: isLocked ? ROADMAP_STATUS_COLORS.locked.text : "#0F1F4B",
                    ...roadmapTextSx.caption,
                    fontWeight: isInCycle || isCurrent ? 800 : roadmapTextSx.caption.fontWeight,
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
                    px: { xs: 1, sm: 1.1, md: 1.25, lg: 1.4, xl: 1.5 },
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 0.8, sm: 0.9, md: 1, lg: 1.1, xl: 1.2 },
                    bgcolor: hasInCycle ? theme.soft : "#F8FAFC",
                    border: hasInCycle
                        ? `1px solid ${theme.color}33`
                        : "1px solid rgba(148,163,184,0.12)",
                    boxShadow: hasInCycle ? `0 8px 18px ${theme.color}14` : "none",
                }}
            >
                <Box
                    sx={{
                        width: roadmapLayout.partIconSize,
                        height: roadmapLayout.partIconSize,
                        borderRadius: 1.5,
                        display: "grid",
                        placeItems: "center",
                        color: theme.color,
                        bgcolor: "#FFFFFF",
                        border: `1px solid ${theme.color}22`,
                    }}
                >
                    {theme.icon}
                </Box>

                <Typography
                    sx={{
                        ...roadmapTextSx.label,
                        color: hasInCycle ? theme.text : "#0F172A",
                    }}
                >
                    Part {roadmap.part_type}
                </Typography>
            </Box>

            <Chip
                label={`${completedCount}/${units.length}`}
                size="small"
                sx={{
                    height: 32,
                    minWidth: roadmapLayout.progressChipMinWidth,
                    borderRadius: 999,
                    ...roadmapTextSx.label,
                    color: theme.color,
                    bgcolor: theme.soft,
                    border: `1px solid ${theme.color}16`,
                }}
            />
        </Stack>
    );
}

function RoadmapLane({
    roadmap,
    statusByLessonManagerId,
    laneContentWidth,
}: {
    roadmap: PartRoadmap;
    statusByLessonManagerId: Map<string, RoadmapUnitStatus>;
    laneContentWidth: ResponsiveNumber;
}) {
    const theme = getPartTheme(roadmap.part_type);
    const units = roadmap.units ?? [];
    const completedCount = countCompletedUnitsInRoadmap(
        roadmap,
        statusByLessonManagerId
    );

    const progressPercent =
        units.length > 1
            ? (Math.min(completedCount, units.length - 1) /
                Math.max(units.length - 1, 1)) *
            100
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
                        right: roadmapLayout.lineInset,
                        top: "50%",
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
                        width: buildResponsiveProgressWidth(progressPercent),
                        maxWidth: responsiveTrackMaxWidth,
                        height: 3,
                        bgcolor: ROADMAP_STATUS_COLORS.completed.main,
                        transform: "translateY(-50%)",
                        borderRadius: 999,
                        zIndex: 1,
                    }}
                />

                <Stack direction="row" alignItems="center" sx={{ position: "relative", zIndex: 2 }}>
                    {units.map((unit, index) => (
                        <RoadmapNode
                            key={unit.lesson_manager_id}
                            unit={unit}
                            status={
                                statusByLessonManagerId.get(String(unit.lesson_manager_id)) ?? "locked"
                            }
                            color={theme.color}
                        />
                    ))}
                </Stack>
            </Box>
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
                    <LockOutlinedIcon sx={{ fontSize: 12, color: ROADMAP_STATUS_COLORS.locked.text }} />
                </Box>
                <Typography variant="body2" sx={{ ...roadmapTextSx.label, color: "#0F1F4B" }}>
                    Khóa
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
                Các node trong cycle là nhóm bài học được chọn cho cycle hiện tại; node đang học là vị trí bạn đang làm dở.
            </Typography>
        </Stack>
    );
}

export default function LearningPathRoadmapCanvas({
    overview,
    onOpenSkillMap,
    onOpenStrategy,
    onOpenReason,
    onOpenCycleDetail,
}: LearningPathRoadmapCanvasProps) {
    const partRoadmaps: PartRoadmap[] =
        overview?.selected_strategy_option?.part_roadmaps ?? [];

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
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                            variant="h5"
                            sx={{
                                ...roadmapTextSx.title,
                                color: "#071947",
                            }}
                        >
                            Canvas lộ trình tổng
                        </Typography>

                        <Tooltip title="7 roadmap Part song song. Cycle hiện tại là nhóm bài được chọn từ các roadmap này.">
                            <InfoOutlinedIcon sx={{ color: "#7C8DB5", fontSize: 20 }} />
                        </Tooltip>
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
                            onClick={onOpenSkillMap}
                            sx={actionButtonSx}
                        >
                            Skill Map
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<TrackChangesIcon />}
                            onClick={onOpenStrategy}
                            sx={actionButtonSx}
                        >
                            Chiến lược
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LightbulbOutlinedIcon />}
                            onClick={onOpenReason}
                            sx={actionButtonSx}
                        >
                            Vì sao?
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LayersOutlinedIcon />}
                            onClick={onOpenCycleDetail}
                            sx={actionButtonSx}
                        >
                            Chi tiết Cycle
                        </Button>
                    </Stack>
                </Stack>

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
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <CanvasLegend />
            </Box>
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
