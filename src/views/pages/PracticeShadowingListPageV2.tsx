import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconButton, Tooltip,
  ToggleButtonGroup, ToggleButton, FormControl, Select, MenuItem, CircularProgress
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestartAlt from '@mui/icons-material/RestartAlt';
import PracticeLayout from '../layouts/PracticeLayout';
import { SectionRow, SectionSkeleton } from '../../components/practices/shadowing-list-v2/ShadowingSectionRow';
import { LessonSectionModal } from '../../components/practices/shadowing-list-v2/ShadowingLessonSectionModal';
import { shadowingV2Service } from '../../services/shadowing_service_v2';

// =====================================================
// TYPES
// =====================================================
export type Level = "ALL" | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ShadowingCategory = 'ALL' | 'TOEIC' | 'TED';

export type ShadowingSummaryLesson = {
  id: string;
  title: string;
  level: Level;
  category: ShadowingCategory;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
  isNew: boolean;
};

export type ShadowingLessonProgress = {
  lessonId: string;
  progress: number;
};

export type ShadowingSummaryLessonSectionMap = {
  toeic: ShadowingSummaryLesson[];
  ted: ShadowingSummaryLesson[];
  newLessons: ShadowingSummaryLesson[];
  inProgress: ShadowingSummaryLesson[];
};

// =====================================================
// MOCK DATABASE
// =====================================================
const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const thumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop';

export const DB: ShadowingSummaryLesson[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `lesson_${i + 1}`,
  title: i % 2 === 0 ? `TOEIC Listening ${i + 1}` : `TED Shadowing ${i + 1}`,
  level: levels[i % levels.length],
  category: i % 2 === 0 ? 'TOEIC' : 'TED',
  thumbnailUrl: thumb,
  audioUrl: '#',
  duration: 25 + i,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  isNew: i % 2 === 0 ? true : false
}));

// =====================================================
// MOCK PROMISE APIs
// =====================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


async function apiGetProgress(ids: string[]): Promise<ShadowingLessonProgress[]> {
  await delay(500);
  return ids
    .filter((_, i) => i % 2 === 0)
    .map((id, i) => ({ lessonId: id, progress: Math.min(95, 15 + i * 18) }));
}

export default function PracticeShadowingListPage(): JSX.Element {
  // =====================================================
  // STATE
  // =====================================================
  const [sections, setSections] = useState<ShadowingSummaryLessonSectionMap>({ toeic: [], ted: [], newLessons: [], inProgress: [] });
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openSection, setOpenSection] = useState<keyof ShadowingSummaryLessonSectionMap | null>(null);
  const inFlightPagesRef = useRef<Set<number>>(new Set());

  const [categoryFilter, setCategoryFilter] = useState<ShadowingCategory>("ALL");
  const [levelFilter, setLevelFilter] = useState<Level>("ALL");

  const buildSections = (
    lessons: ShadowingSummaryLesson[],
    progressObj: Record<string, number>
  ) => {
    const inProgress = lessons
      .filter((lesson) => (progressObj[lesson.id] || 0) > 0)
      .slice(0, 10);

    if (categoryFilter === "ALL") {
      setSections({
        toeic: lessons.filter((shadowing) => shadowing.category === "TOEIC"),
        ted: lessons.filter((shadowing) => shadowing.category === "TED"),
        newLessons: lessons.filter((shadowing) => shadowing.isNew),
        inProgress,
      });
      return;
    }

    setSections({
      toeic: categoryFilter === "TOEIC" ? lessons : [],
      ted: categoryFilter === "TED" ? lessons : [],
      newLessons: [],
      inProgress,
    });
  };

  const fetchPage = async (pageToLoad: number, mode: "replace" | "append") => {
    if (inFlightPagesRef.current.has(pageToLoad)) {
      return;
    }

    const limit = categoryFilter === "ALL" ? 5 : 20;
    const loadingSetter = mode === "replace" ? setLoading : setIsLoadingMore;

    try {
      inFlightPagesRef.current.add(pageToLoad);
      loadingSetter(true);

      const shadowingLessons = await shadowingV2Service.getList({
        category: categoryFilter,
        level: levelFilter,
        limit,
        page: pageToLoad,
      });

      if (!shadowingLessons) {
        return;
      }

      const mergedLessons = mode === "append"
        ? Array.from(new Map([...sections.toeic, ...sections.ted, ...shadowingLessons].map(x => [x.id, x])).values())
        : shadowingLessons;

      const newIds = shadowingLessons
        .map((lesson) => lesson.id)
        .filter((id) => !(progressMap[id] > 0 || progressMap[id] === 0));

      const progressRes = newIds.length > 0 ? await apiGetProgress(newIds) : [];
      const updatedProgress = progressRes.reduce<Record<string, number>>((acc, item) => {
        acc[item.lessonId] = item.progress;
        return acc;
      }, {});

      const nextProgressMap = { ...progressMap, ...updatedProgress };

      setProgressMap(nextProgressMap);
      buildSections(mergedLessons, nextProgressMap);

      setPage(pageToLoad);
      setHasMore(shadowingLessons.length >= limit);
    } finally {
      inFlightPagesRef.current.delete(pageToLoad);
      loadingSetter(false);
    }
  };

  // =====================================================
  // FETCH LISTS
  // =====================================================
  useEffect(() => {
    fetchPage(1, "replace");
    setOpenSection(null);
  }, [categoryFilter, levelFilter]);

  useEffect(() => {
    if (categoryFilter === "ALL") {
      return;
    }

    const container = document.querySelector<HTMLElement>(".custom-scrollbar");
    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (loading || isLoadingMore || !hasMore) {
        return;
      }

      const remaining = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (remaining < 200) {
        fetchPage(page + 1, "append");
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [categoryFilter, page, hasMore, isLoadingMore, loading, levelFilter]);

  const configs: { key: keyof ShadowingSummaryLessonSectionMap; title: string }[] = useMemo(() => {
    if (categoryFilter === 'ALL') {
      return [
        { key: 'inProgress', title: 'In Progress' },
        { key: 'newLessons', title: 'New' },
        { key: 'toeic', title: 'TOEIC' },
        { key: 'ted', title: 'TED' },
      ];
    }

    return [
      { key: 'inProgress', title: 'In Progress' },
      { key: categoryFilter === 'TOEIC' ? 'toeic' : 'ted', title: categoryFilter },
    ];
  }, [categoryFilter]);

  return (
    <PracticeLayout>
      <div className="min-h-screen p-4 md:p-8 text-slate-800">
        {/* HEADER */}
        <div className="mb-8 space-y-6">
          <div className="relative flex justify-center">
            <div className="absolute left-0 top-0">
              <IconButton
                sx={{
                  backgroundColor: '#f1f5f9',
                  '&:hover': {
                    backgroundColor: '#e2e8f0',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </div>

            <div className="text-center px-14">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
                Shadowing Practice
              </h1>

              <p className="mt-2 text-slate-500">
                Luyện nghe nói với{' '}
                <span className="font-semibold text-blue-600">
                  TOEIC
                </span>{' '}
                và{' '}
                <span className="font-semibold text-purple-600">
                  TED
                </span>
              </p>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              {/* LEFT SIDE: CATEGORY + LEVEL */}
              <div className="flex flex-col md:flex-row gap-5 w-full md:w-auto">

                {/* CATEGORY */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category
                  </p>

                  <ToggleButtonGroup
                    exclusive
                    value={categoryFilter}
                    onChange={(_, val) => {
                      if (val) setCategoryFilter(val);
                    }}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '10px !important',
                        border: '1px solid #e2e8f0',
                        px: 2.5,
                      },
                      '& .Mui-selected': {
                        backgroundColor: '#2563eb !important',
                        color: '#fff !important',
                      },
                    }}
                  >
                    <ToggleButton value="ALL">All</ToggleButton>
                    <ToggleButton value="TOEIC">TOEIC</ToggleButton>
                    <ToggleButton value="TED">TED</ToggleButton>
                  </ToggleButtonGroup>
                </div>

                {/* LEVEL */}
                <div className="min-w-[180px]">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Level
                  </p>

                  <FormControl fullWidth size="small">
                    <Select
                      value={levelFilter}
                      onChange={(e) =>
                        setLevelFilter(e.target.value as any)
                      }
                    >
                      <MenuItem value="ALL">All Levels</MenuItem>
                      <MenuItem value="A1">A1</MenuItem>
                      <MenuItem value="A2">A2</MenuItem>
                      <MenuItem value="B1">B1</MenuItem>
                      <MenuItem value="B2">B2</MenuItem>
                      <MenuItem value="C1">C1</MenuItem>
                      <MenuItem value="C2">C2</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* RIGHT SIDE: RESET ICON */}
              <div className="flex justify-end">
                <Tooltip title="Reset Filter" arrow>
                  <IconButton
                    onClick={() => {
                      setCategoryFilter('ALL');
                      setLevelFilter('ALL');
                    }}
                    sx={{
                      width: 42,
                      height: 42,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fff',
                      color: '#64748b',
                      transition: 'all .2s ease',
                      '&:hover': {
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderColor: '#bfdbfe',
                      },
                    }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="space-y-10">
            {configs.map((section) => (
              <SectionSkeleton
                key={section.key}
                title={section.title}
              />
            ))}
          </div>
        )}

        {/* CONTENT */}
        {!loading && (
          <div className="space-y-10">
            {configs.map(section => (
              <SectionRow
                key={section.key}
                title={section.title}
                items={sections[section.key]}
                isAllCategory={categoryFilter === "ALL"}
                progressMap={progressMap}
                onShowMore={() => setOpenSection(section.key)}
              />
            ))}
            {isLoadingMore && (
              <div className="flex justify-center py-6">
                <CircularProgress size={28} />
              </div>
            )}
          </div>
        )}

        {/* MODAL */}
        <LessonSectionModal
          open={Boolean(openSection)}
          title={
            configs.find(
              (x) => x.key === openSection
            )?.title || ''
          }
          category={
            openSection === 'toeic'
              ? 'TOEIC'
              : openSection === 'ted'
                ? 'TED'
                : 'ALL'
          }
          sectionKey={openSection || 'toeic'}
          progressMap={progressMap}
          onClose={() =>
            setOpenSection(null)
          }
        />
      </div>
    </PracticeLayout>
  );
}
