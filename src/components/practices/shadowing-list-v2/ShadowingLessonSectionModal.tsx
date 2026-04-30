import { useEffect, useMemo, useState } from "react";
import { Level, ShadowingSummaryLesson } from "../../../views/pages/PracticeShadowingListPageV2";
import { Dialog, DialogContent, DialogTitle, FormControl, IconButton, MenuItem, Select, Slide } from "@mui/material";
import { Close } from "@mui/icons-material";
import { LessonCard } from "./ShadowingLessonCard";

export type SortValue =
    | 'newest'
    | 'durationAsc'
    | 'durationDesc'
    | 'progressDesc';

type LessonSectionModalProps = {
    open: boolean;
    title: string;
    items: ShadowingSummaryLesson[];
    progressMap: Record<string, number>;
    onClose: () => void;
};

export function LessonSectionModal({
    open,
    title,
    items,
    progressMap,
    onClose,
}: LessonSectionModalProps): JSX.Element {
    const [levelFilter, setLevelFilter] =
        useState<'ALL' | Level>('ALL');

    const [sortBy, setSortBy] =
        useState<SortValue>('newest');

    /* reset state mỗi lần đóng */
    useEffect(() => {
        if (!open) {
            setLevelFilter('ALL');
            setSortBy('newest');
        }
    }, [open]);

    const finalItems = useMemo(() => {
        let data = [...items];

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

        return data;
    }, [items, levelFilter, sortBy, progressMap]);

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

            <DialogContent>
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
                    {finalItems.map((item) => (
                        <LessonCard
                            key={item.id}
                            item={item}
                            progress={
                                progressMap[item.id] || 0
                            }
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
