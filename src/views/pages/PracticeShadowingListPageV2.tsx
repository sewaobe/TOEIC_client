import { useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, IconButton, Skeleton, Tooltip,
  ToggleButtonGroup, ToggleButton, FormControl, Select, MenuItem
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTime from '@mui/icons-material/AccessTime';
import Close from '@mui/icons-material/Close';
import ArrowForward from '@mui/icons-material/ArrowForward';
import RestartAlt from '@mui/icons-material/RestartAlt';
import PracticeLayout from '../layouts/PracticeLayout';

// =====================================================
// TYPES
// =====================================================
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Category = 'TOEIC' | 'TED';

type Lesson = {
  id: string;
  title: string;
  level: Level;
  category: Category;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
};

type LessonProgress = {
  lessonId: string;
  progress: number;
};

type SectionMap = {
  toeic: Lesson[];
  ted: Lesson[];
  newLessons: Lesson[];
  inProgress: Lesson[];
};

// =====================================================
// MOCK DATABASE
// =====================================================
const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const thumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop';

const DB: Lesson[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `lesson_${i + 1}`,
  title: i % 2 === 0 ? `TOEIC Listening ${i + 1}` : `TED Shadowing ${i + 1}`,
  level: levels[i % levels.length],
  category: i % 2 === 0 ? 'TOEIC' : 'TED',
  thumbnailUrl: thumb,
  audioUrl: '#',
  duration: 25 + i,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

// =====================================================
// MOCK PROMISE APIs
// =====================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function apiGetHomeSections(): Promise<{ toeic: Lesson[]; ted: Lesson[] }> {
  await delay(700);
  return {
    toeic: DB.filter(x => x.category === 'TOEIC').slice(0, 5),
    ted: DB.filter(x => x.category === 'TED').slice(0, 5),
  };
}

async function apiGetNewLessons(): Promise<Lesson[]> {
  await delay(600);
  return [...DB]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 10);
}

async function apiGetProgress(ids: string[]): Promise<LessonProgress[]> {
  await delay(500);
  return ids
    .filter((_, i) => i % 2 === 0)
    .map((id, i) => ({ lessonId: id, progress: Math.min(95, 15 + i * 18) }));
}

export default function PracticeShadowingListPage(): JSX.Element {
  // =====================================================
  // STATE
  // =====================================================
  const [sections, setSections] = useState<SectionMap>({ toeic: [], ted: [], newLessons: [], inProgress: [] });
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<keyof SectionMap | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<"ALL" | Category>("ALL");
  const [levelFilter, setLevelFilter] = useState<"ALL" | Level>("ALL");

  // =====================================================
  // FETCH 3 APIs
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [homeRes, newRes] = await Promise.all([
          apiGetHomeSections(),
          apiGetNewLessons(),
        ]);

        const allLessons = [...homeRes.toeic, ...homeRes.ted, ...newRes];
        const uniqueLessons = Array.from(new Map(allLessons.map(x => [x.id, x])).values());
        const ids = uniqueLessons.map(x => x.id);

        const progressRes = await apiGetProgress(ids);
        const progressObj = progressRes.reduce<Record<string, number>>((acc, item) => {
          acc[item.lessonId] = item.progress;
          return acc;
        }, {});

        const inProgress = uniqueLessons.filter(x => progressObj[x.id] > 0).slice(0, 10);

        setProgressMap(progressObj);
        setSections({
          toeic: homeRes.toeic,
          ted: homeRes.ted,
          newLessons: newRes,
          inProgress,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const configs: { key: keyof SectionMap; title: string }[] = useMemo(() => [
    { key: 'inProgress', title: 'In Progress' },
    { key: 'newLessons', title: 'New' },
    { key: 'toeic', title: 'TOEIC' },
    { key: 'ted', title: 'TED' },
  ], []);


  // =====================================================
  // FILTER LOGIC
  // =====================================================

  const filteredSections = useMemo(() => {
    const applyFilter = (items: Lesson[]) => {
      return items.filter((item) => {
        const matchCategory =
          categoryFilter === "ALL" || item.category === categoryFilter;

        const matchLevel =
          levelFilter === "ALL" || item.level === levelFilter;

        return matchCategory && matchLevel;
      });
    };

    return {
      inProgress: applyFilter(sections.inProgress),
      newLessons: applyFilter(sections.newLessons),
      toeic: applyFilter(sections.toeic),
      ted: applyFilter(sections.ted),
    };
  }, [sections, categoryFilter, levelFilter]);

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
                progressMap={progressMap}
                onShowMore={() => setOpenSection(section.key)}
              />
            ))}
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
          items={
            openSection
              ? sections[openSection]
              : []
          }
          progressMap={progressMap}
          onClose={() =>
            setOpenSection(null)
          }
        />
      </div>
    </PracticeLayout>
  );
}

type SortValue =
  | 'newest'
  | 'durationAsc'
  | 'durationDesc'
  | 'progressDesc';

type LessonSectionModalProps = {
  open: boolean;
  title: string;
  items: Lesson[];
  progressMap: Record<string, number>;
  onClose: () => void;
};

function LessonSectionModal({
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

// =====================================================
// SECTION ROW
// =====================================================
function SectionRow({ title, items, progressMap, onShowMore }: {
  title: string;
  items: Lesson[];
  progressMap: Record<string, number>;
  onShowMore: () => void;
}): JSX.Element {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button hidden={items.length <= 5} endIcon={<ArrowForward />} onClick={onShowMore}>View more</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {items.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No lessons found
          </div>
        ) : items.slice(0, 5).map(item => (
          <LessonCard key={item.id} item={item} progress={progressMap[item.id] || 0} />
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton({
  title,
}: {
  title: string;
}): JSX.Element {
  return (
    <section>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">
          {title}
        </h2>

        <Skeleton
          variant="rounded"
          width={110}
          height={36}
        />
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LessonCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// =====================================================
// LESSON CARD
// =====================================================
function LessonCard({
  item,
  progress,
}: {
  item: Lesson;
  progress: number;
}): JSX.Element {
  const handleNavigate = () => {
    console.log("Open lesson:", item.id);
  };

  return (
    <Card
      onClick={handleNavigate}
      className="
        group relative cursor-pointer select-none !overflow-hidden
        !rounded-xl !border !border-slate-200 !bg-white

        !transform-gpu
        !transition-all !duration-300 !ease-out

        hover:!-translate-y-1
        hover:!scale-[1.01]
        hover:!shadow-xl
        hover:!border-blue-500/40

        active:!translate-y-0
        active:!scale-[0.99]
      "
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleNavigate()
      }}
      role="button"
    >
      {/* ===================================================== */}
      {/* THUMBNAIL */}
      {/* ===================================================== */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {/* IMAGE */}
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="
            h-full w-full object-cover

            transition-transform duration-500 ease-out
            group-hover:scale-105
          "
          onError={(e) => e.currentTarget.src = 'https://res.cloudinary.com/dgi1g967z/image/upload/v1777526725/ntq9gb4ofuvewcabwcyu.webp'}
        />

        {/* DARK OVERLAY */}
        <div
          className="
            absolute inset-0 bg-black/5
            group-hover:bg-black/15
            transition-colors duration-300
          "
        />

        {/* ===================================================== */}
        {/* TOP LEFT - LEVEL */}
        {/* ===================================================== */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <div
            className="
              rounded-md bg-red-500
              px-2 py-1
              text-[10px] sm:text-xs
              font-bold text-white
              shadow-md
            "
          >
            {item.level}
          </div>
        </div>

        {/* ===================================================== */}
        {/* BOTTOM RIGHT - DURATION */}
        {/* ===================================================== */}
        <div
          className="
            absolute bottom-2 right-2 z-10
            flex items-center gap-1
            rounded-md bg-black/60
            px-2 py-1
            text-[11px] sm:text-xs
            font-medium text-white
            backdrop-blur-sm

            transition-all duration-300
            group-hover:bg-black/70
          "
        >
          <AccessTime sx={{ fontSize: 14 }} />
          <span>{item.duration} min</span>
        </div>
      </div>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}
      <CardContent className="p-3 sm:p-4">
        {/* TITLE */}
        <h3
          className="
            min-h-[40px] sm:min-h-[48px]
            line-clamp-2
            text-sm sm:text-base
            font-semibold text-slate-800

            transition-colors duration-300
            group-hover:text-blue-600
          "
        >
          {item.title}
        </h3>

        {/* ===================================================== */}
        {/* PROGRESS SECTION */}
        {/* ===================================================== */}
        <div className="mt-3">
          {progress > 0 ? (
            <>
              <div className="mb-1.5 flex items-center justify-between text-[11px] sm:text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium text-slate-700">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                <div
                  className="
                    h-full bg-blue-600
                    transition-all duration-700 ease-out
                  "
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <p
              className="
                text-xs sm:text-sm text-slate-500
                transition-colors duration-300
                group-hover:text-slate-700
              "
            >
              Not started
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LessonCardSkeleton(): JSX.Element {
  return (
    <Card
      className="
        !rounded-xl
        !border
        !border-slate-200
        !shadow-none
        overflow-hidden
        h-full
      "
    >
      {/* thumbnail */}
      <div className="aspect-video">
        <Skeleton
          variant="rectangular"
          animation="wave"
          className="h-full w-full"
        />
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* title */}
        <div className="min-h-[40px] sm:min-h-[48px] space-y-1">
          <Skeleton variant="text" height={20} width="90%" />
          <Skeleton variant="text" height={20} width="60%" />
        </div>

        {/* progress */}
        <div className="mt-3">
          <div className="flex justify-between mb-1.5">
            <Skeleton variant="text" width={55} height={18} />
            <Skeleton variant="text" width={35} height={18} />
          </div>

          <Skeleton
            variant="rounded"
            height={6}
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// /* =====================================================
//    OVERALL PROGRESS CARD (Reusable)
// ===================================================== */
// function OverallProgressCard({
//   completedPercent,
//   totalLessons,
//   totalHours,
//   streakDays,
// }: {
//   completedPercent: number;
//   totalLessons: number;
//   totalHours: number;
//   streakDays: number;
// }) {
//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
//       {/* LEFT */}
//       <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//         <div className="mb-5 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-slate-900">
//             Overall Progress
//           </h3>

//           <span className="text-sm text-slate-500">
//             Keep going 🚀
//           </span>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {/* Progress */}
//           <div className="rounded-xl bg-slate-50 p-4">
//             <p className="text-xs uppercase tracking-wider text-slate-400">
//               Completion
//             </p>
//             <p className="mt-2 text-2xl font-bold text-blue-600">
//               {completedPercent}%
//             </p>

//             <LinearProgress
//               variant="determinate"
//               value={completedPercent}
//               sx={{
//                 mt: 1.5,
//                 height: 6,
//                 borderRadius: 99,
//               }}
//             />
//           </div>

//           {/* Lessons */}
//           <div className="rounded-xl bg-slate-50 p-4">
//             <p className="text-xs uppercase tracking-wider text-slate-400">
//               Lessons
//             </p>
//             <p className="mt-2 text-2xl font-bold text-slate-800">
//               {totalLessons}
//             </p>
//             <p className="text-sm text-slate-500 mt-1">
//               Finished
//             </p>
//           </div>

//           {/* Hours */}
//           <div className="rounded-xl bg-slate-50 p-4">
//             <p className="text-xs uppercase tracking-wider text-slate-400">
//               Study Time
//             </p>
//             <p className="mt-2 text-2xl font-bold text-slate-800">
//               {totalHours}h
//             </p>
//             <p className="text-sm text-slate-500 mt-1">
//               Total
//             </p>
//           </div>

//           {/* Streak */}
//           <div className="rounded-xl bg-slate-50 p-4">
//             <p className="text-xs uppercase tracking-wider text-slate-400">
//               Streak
//             </p>

//             <div className="mt-2 flex items-center gap-2">
//               <LocalFireDepartment
//                 sx={{ color: '#f97316', fontSize: 28 }}
//               />
//               <span className="text-2xl font-bold text-slate-800">
//                 {streakDays}
//               </span>
//             </div>

//             <p className="text-sm text-slate-500 mt-1">
//               Days
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SUGGESTION */}
//       <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
//         <div className="flex items-center gap-2">
//           <EmojiObjects sx={{ color: '#f59e0b' }} />
//           <h3 className="font-semibold text-slate-900">
//             Gợi ý cho bạn
//           </h3>
//         </div>

//         <p className="mt-3 text-sm leading-6 text-slate-600">
//           Luyện tập đều đặn mỗi ngày 15–20 phút sẽ giúp cải thiện
//           Listening & Speaking nhanh hơn.
//         </p>

//         <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-slate-700 border border-amber-100">
//           🎯 Mục tiêu hôm nay: hoàn thành 1 lesson đang dang dở.
//         </div>
//       </div>
//     </div>
//   );
// }