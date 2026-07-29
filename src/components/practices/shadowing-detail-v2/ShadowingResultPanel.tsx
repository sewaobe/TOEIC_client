import {
  ArrowBack,
  CheckCircle,
  GraphicEq,
  Replay,
  Schedule,
  Speed,
  TrendingUp,
} from '@mui/icons-material';
import type {
  ShadowingAttempt,
  ShadowingSegmentAttempt,
  ShadowingSegmentResult,
} from '../../../types/ShadowingAttempt';

interface ShadowingResultPanelProps {
  lesson: {
    title: string;
    level?: string;
    duration?: number;
    segmentCount: number;
  };
  attempt?: ShadowingAttempt | null;
  fallbackResults: ShadowingSegmentResult[];
  fallbackCompletedIndices: number[];
  onPracticeAgain: () => void;
  onBackToList: () => void;
}

const getLatestAttempt = (segment: ShadowingSegmentResult): ShadowingSegmentAttempt | null => {
  if (!segment.attempts?.length) return null;
  return segment.attempts[segment.attempts.length - 1];
};

const getAverageScore = (segments: ShadowingSegmentResult[]) => {
  const latestAttempts = segments.map(getLatestAttempt).filter(Boolean) as ShadowingSegmentAttempt[];
  if (!latestAttempts.length) return 0;
  return Math.round(
    latestAttempts.reduce((sum, attempt) => sum + (attempt.similarity_score || 0), 0) /
      latestAttempts.length,
  );
};

const getTotalDuration = (segments: ShadowingSegmentResult[]) =>
  segments.reduce((sum, segment) => sum + (getLatestAttempt(segment)?.duration || 0), 0);

const formatDuration = (seconds?: number) => {
  const safeSeconds = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  if (!minutes) return `${rest}s`;
  return `${minutes}m ${rest.toString().padStart(2, '0')}s`;
};

const formatAttemptTime = (value?: Date | string) => {
  if (!value) return 'Không rõ thời điểm';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời điểm';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

const getScoreTone = (score = 0) => {
  if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (score >= 80) return 'text-blue-700 bg-blue-50 border-blue-100';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-rose-700 bg-rose-50 border-rose-100';
};

export default function ShadowingResultPanel({
  lesson,
  attempt,
  fallbackResults,
  fallbackCompletedIndices,
  onPracticeAgain,
  onBackToList,
}: ShadowingResultPanelProps) {
  const segmentResults = attempt?.segment_results?.length
    ? attempt.segment_results
    : fallbackResults;
  const totalSegments = attempt?.total_segments || lesson.segmentCount || segmentResults.length;
  const completedSegments =
    attempt?.completed_segments || fallbackCompletedIndices.length || segmentResults.length;
  const averageScore = attempt?.similarity_score ?? getAverageScore(segmentResults);
  const totalDuration = attempt?.duration ?? getTotalDuration(segmentResults);
  const strongSegments = segmentResults.filter((segment) => {
    const latest = getLatestAttempt(segment);
    return (latest?.similarity_score || 0) >= 80;
  }).length;
  const totalAttemptCount = segmentResults.reduce(
    (sum, segment) => sum + (segment.attempts?.length || 0),
    0,
  );
  const lowestSegments = [...segmentResults]
    .sort((a, b) => (getLatestAttempt(a)?.similarity_score || 0) - (getLatestAttempt(b)?.similarity_score || 0))
    .slice(0, 3);

  return (
    <div className="col-start-1 row-start-1 row-span-2 overflow-y-auto bg-slate-50 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-5 text-white md:px-7 md:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  <CheckCircle className="h-4 w-4" />
                  Hoàn thành Shadowing
                </div>
                <h1 className="text-2xl font-bold tracking-normal md:text-3xl">{lesson.title}</h1>
                <p className="mt-2 text-sm text-blue-50">
                  {lesson.level || 'Không rõ level'} · {completedSegments}/{totalSegments} câu ·{' '}
                  {formatDuration(totalDuration)}
                </p>
              </div>

              <div className="rounded-2xl bg-white px-5 py-4 text-center text-blue-700 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Điểm trung bình
                </p>
                <p className="mt-1 text-4xl font-black">{Math.round(averageScore)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-4 md:p-5">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <Speed className="mb-3 h-5 w-5 text-blue-600" />
              <p className="text-xs font-semibold text-slate-500">Similarity</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{Math.round(averageScore)}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <GraphicEq className="mb-3 h-5 w-5 text-indigo-600" />
              <p className="text-xs font-semibold text-slate-500">Segment</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {completedSegments}/{totalSegments}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <Schedule className="mb-3 h-5 w-5 text-violet-600" />
              <p className="text-xs font-semibold text-slate-500">Tổng thời gian</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(totalDuration)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <TrendingUp className="mb-3 h-5 w-5 text-emerald-600" />
              <p className="text-xs font-semibold text-slate-500">Câu đạt tốt</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{strongSegments}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Chi tiết từng câu</h2>
                <p className="text-sm text-slate-500">
                  Ưu tiên hiển thị lần thử gần nhất của mỗi câu.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalAttemptCount} lượt thử
              </span>
            </div>

            <div className="space-y-3">
              {segmentResults.map((segment) => {
                const latest = getLatestAttempt(segment);
                const score = latest?.similarity_score || 0;
                const previousAttempts = segment.attempts?.slice(0, -1).reverse() || [];

                return (
                  <article
                    key={segment.index}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                            #{segment.index + 1}
                          </span>
                          <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getScoreTone(score)}`}>
                            {Math.round(score)}%
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {formatDuration(latest?.duration)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold leading-6 text-slate-900">{segment.text}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          <span className="font-semibold text-slate-800">Bạn nói: </span>
                          {latest?.user_transcript || 'Chưa có transcript.'}
                        </p>
                        {latest?.feedback && (
                          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-sm leading-6 text-slate-600">
                            {latest.feedback}
                          </p>
                        )}
                      </div>
                    </div>

                    {previousAttempts.length > 0 && (
                      <details className="mt-3 rounded-lg bg-white px-3 py-2">
                        <summary className="cursor-pointer text-sm font-semibold text-blue-700">
                          Xem {previousAttempts.length} lần thử trước
                        </summary>
                        <div className="mt-3 space-y-2">
                          {previousAttempts.map((item, index) => (
                            <div
                              key={`${segment.index}-${index}-${item.attempted_at}`}
                              className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm"
                            >
                              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="font-bold text-slate-700">
                                  {Math.round(item.similarity_score || 0)}%
                                </span>
                                <span>{formatDuration(item.duration)}</span>
                                <span>{formatAttemptTime(item.attempted_at)}</span>
                              </div>
                              <p className="text-slate-600">{item.user_transcript || 'Không có transcript.'}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Tổng kết nhanh</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bạn đã hoàn thành bài shadowing này. Các câu có điểm thấp nhất nên được luyện lại
                trước để cải thiện độ rõ và độ khớp transcript.
              </p>
              <div className="mt-4 space-y-2">
                {lowestSegments.map((segment) => (
                  <div
                    key={`lowest-${segment.index}`}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-slate-700">Câu #{segment.index + 1}</span>
                    <span className="text-sm font-bold text-slate-900">
                      {Math.round(getLatestAttempt(segment)?.similarity_score || 0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Tiếp theo</h2>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onPracticeAgain}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  <Replay className="h-4 w-4" />
                  Luyện lại trong bài
                </button>
                <button
                  type="button"
                  onClick={onBackToList}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <ArrowBack className="h-4 w-4" />
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
