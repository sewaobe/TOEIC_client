import { useEffect, useMemo, useRef, useState } from "react";
import { Level, ShadowingCategory, ShadowingSummaryLesson, ShadowingSummaryLessonSectionMap } from "../../../views/pages/PracticeShadowingListPageV2";
import { CircularProgress, Dialog, DialogContent, DialogTitle, FormControl, IconButton, MenuItem, Select, Slide } from "@mui/material";
import { Close } from "@mui/icons-material";
import { LessonCard } from "./ShadowingLessonCard";
import { shadowingV2Service } from "../../../services/shadowing_service_v2";

export type SortValue =
    | 'newest'
    | 'durationAsc'
    | 'durationDesc'
    | 'progressDesc';

type LessonSectionModalProps = {
    open: boolean;
    title: string;
    category: ShadowingCategory;
    sectionKey: keyof ShadowingSummaryLessonSectionMap;
    progressMap: Record<string, number>;
    onClose: () => void;
};

const dedupeLessonsById = (lessons: ShadowingSummaryLesson[]) => {
    return Array.from(new Map(lessons.map((lesson) => [lesson.id, lesson])).values());
};

export function LessonSectionModal({
    open,
    title,
    category,
    sectionKey,
    progressMap,
    onClose,
}: LessonSectionModalProps): JSX.Element {
    const [items, setItems] = useState<ShadowingSummaryLesson[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const inFlightPagesRef = useRef<Set<number>>(new Set());
    const [levelFilter, setLevelFilter] =
        useState<'ALL' | Level>('ALL');

    const [sortBy, setSortBy] =
        useState<SortValue>('newest');

    /* reset state mỗi lần đóng */
    useEffect(() => {
        if (!open) {
            setLevelFilter('ALL');
            setSortBy('newest');
            setItems([]);
            setPage(1);
            setHasMore(true);
        }
    }, [open]);

    const fetchPage = async (pageToLoad: number, mode: 'replace' | 'append') => {
        if (inFlightPagesRef.current.has(pageToLoad)) {
            return;
        }

        setIsLoading(true);
        try {
            inFlightPagesRef.current.add(pageToLoad);
            const data = await shadowingV2Service.getList({
                category,
                level: levelFilter,
                limit: 20,
                page: pageToLoad,
            });

            if (!data) return;

            const expectedSize = category === 'ALL' ? 60 : 20;
            const reachedEnd = data.length < expectedSize;

            setHasMore(!reachedEnd);
            setPage(pageToLoad);
            setItems(prev => dedupeLessonsById(mode === 'replace' ? data : [...prev, ...data]));
        } finally {
            inFlightPagesRef.current.delete(pageToLoad);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        fetchPage(1, 'replace');
    }, [open, category, levelFilter]);

    const finalItems = useMemo(() => {
        let data = [...items];

        if (sectionKey === 'newLessons') {
            data = data.filter((item) => item.isNew);
        }

        if (sectionKey === 'inProgress') {
            data = data.filter((item) => (progressMap[item.id] || 0) > 0);
        }

        /* filter level */
        if (levelFilter !== 'ALL') {
            data = data.filter(
                (item) => item.level === levelFilter
            );
        }

        /* sort */
        switch (sortBy) {
            case 'durationAsc':
                data.sort((a, b) => a.duration - b.duration);
                break;

            case 'durationDesc':
                data.sort((a, b) => b.duration - a.duration);
                break;

            case 'progressDesc':
                data.sort(
                    (a, b) =>
                        (progressMap[b.id] || 0) -
                        (progressMap[a.id] || 0)
                );
                break;

            default:
                data.sort(
                    (a, b) =>
                        +new Date(b.createdAt) -
                        +new Date(a.createdAt)
                );
        }

        return dedupeLessonsById(data);
    }, [items, levelFilter, sortBy, progressMap, sectionKey]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (isLoading || !hasMore || items.length < 15) {
            return;
        }

        const target = event.currentTarget;
        const remaining = target.scrollHeight - target.scrollTop - target.clientHeight;

        if (remaining < 200) {
            fetchPage(page + 1, 'append');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            slots={{ transition: Slide }}
            slotProps={{
                transition: { direction: 'up' },
                paper: {
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                    },
                },
            }}
        >
            {/* HEADER */}
            <DialogTitle className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        {title}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        {finalItems.length} lessons
                    </p>
                </div>

                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent onScroll={handleScroll}>
                {/* TOOLBAR */}
                <div className="mb-5 flex flex-col sticky top-0 z-10 bg-white md:flex-row gap-3 md:items-center md:justify-between">
                    {/* LEFT */}
                    <div className="flex gap-3 flex-col sm:flex-row">
                        {/* LEVEL */}
                        <FormControl size="small">
                            <Select
                                value={levelFilter}
                                onChange={(e) =>
                                    setLevelFilter(
                                        e.target.value as 'ALL' | Level
                                    )
                                }
                            >
                                <MenuItem value="ALL">
                                    All Levels
                                </MenuItem>
                                <MenuItem value="A1">A1</MenuItem>
                                <MenuItem value="A2">A2</MenuItem>
                                <MenuItem value="B1">B1</MenuItem>
                                <MenuItem value="B2">B2</MenuItem>
                                <MenuItem value="C1">C1</MenuItem>
                                <MenuItem value="C2">C2</MenuItem>
                            </Select>
                        </FormControl>

                        {/* SORT */}
                        <FormControl size="small">
                            <Select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value as SortValue
                                    )
                                }
                            >
                                <MenuItem value="newest">
                                    Newest
                                </MenuItem>
                                <MenuItem value="durationAsc">
                                    Duration ↑
                                </MenuItem>
                                <MenuItem value="durationDesc">
                                    Duration ↓
                                </MenuItem>
                                <MenuItem value="progressDesc">
                                    Progress
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-1">

                    {finalItems.length === 0 ? (
                        <div className="py-10 text-center text-slate-400">
                            No lessons found
                        </div>
                    ) : finalItems.map((item) => (
                        <LessonCard
                            key={item.id}
                            item={item}
                            progress={
                                progressMap[item.id] || 0
                            }
                        />
                    ))}
                </div>

                {isLoading && (
                    <div className="flex justify-center py-6">
                        <CircularProgress size={28} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
