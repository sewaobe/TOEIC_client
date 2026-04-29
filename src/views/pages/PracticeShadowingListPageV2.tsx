import { useEffect, useMemo, useState } from 'react';
import {
  Card, CardContent, CardMedia, Button, Chip, Dialog, DialogTitle,
  DialogContent, IconButton, Skeleton, CircularProgress
} from '@mui/material';
import { PlayArrow, AccessTime, Close, ArrowForward } from '@mui/icons-material';
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
    { key: 'inProgress', title: 'Đang luyện dở' },
    { key: 'newLessons', title: 'Bài mới' },
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            Shadowing Practice
          </h1>

          <p className="mt-2 text-slate-500">
            Luyện nghe nói với TOEIC và TED.
          </p>
        </div>

        {/* ===================================================== */}
        {/* FILTER CHIPS */}
        {/* ===================================================== */}
        {!loading && (
          <div className="mb-8 space-y-4">
            {/* Category */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-600">
                Category
              </p>

              <div className="flex flex-wrap gap-2">
                {["ALL", "TOEIC", "TED"].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    clickable
                    color={
                      categoryFilter === item ? "primary" : "default"
                    }
                    variant={
                      categoryFilter === item ? "filled" : "outlined"
                    }
                    onClick={() =>
                      setCategoryFilter(
                        item as "ALL" | Category
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-600">
                Level
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "ALL",
                  "A1",
                  "A2",
                  "B1",
                  "B2",
                  "C1",
                  "C2",
                ].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    clickable
                    color={levelFilter === item ? "primary" : "default"}
                    variant={
                      levelFilter === item ? "filled" : "outlined"
                    }
                    onClick={() =>
                      setLevelFilter(
                        item as "ALL" | Level
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20"><CircularProgress /></div>
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
        <Dialog open={Boolean(openSection)} onClose={() => setOpenSection(null)} maxWidth="xl" fullWidth>
          <DialogTitle className="flex items-center justify-between">
            <span>{configs.find(x => x.key === openSection)?.title}</span>
            <IconButton onClick={() => setOpenSection(null)}><Close /></IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-2">
              {(openSection ? sections[openSection] : []).map(item => (
                <LessonCard key={item.id} item={item} progress={progressMap[item.id] || 0} />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PracticeLayout>
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
        <Button endIcon={<ArrowForward />} onClick={onShowMore}>Show more</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {items.slice(0, 5).map(item => (
          <LessonCard key={item.id} item={item} progress={progressMap[item.id] || 0} />
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
        group relative cursor-pointer select-none overflow-hidden
        !rounded-xl !border !border-slate-200 !bg-white

        !transform-gpu
        !transition-all !duration-300 !ease-out

        hover:-translate-y-1
        hover:scale-[1.01]
        hover:shadow-xl
        hover:border-blue-500/40

        active:translate-y-0
        active:scale-[0.99]
      "
      tabIndex={0}
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
        />

        {/* DARK OVERLAY */}
        <div
          className="
            absolute inset-0 bg-black/20
            group-hover:bg-black/30
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