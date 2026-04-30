import { Card, CardContent, Skeleton } from "@mui/material";
import { ShadowingSummaryLesson } from "../../../views/pages/PracticeShadowingListPageV2";
import { AccessTime } from "@mui/icons-material";

export function LessonCard({
  item,
  progress,
}: {
  item: ShadowingSummaryLesson;
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

export function LessonCardSkeleton(): JSX.Element {
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