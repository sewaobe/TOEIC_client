import { Button, Skeleton } from "@mui/material";
import { ShadowingSummaryLesson } from "../../../views/pages/PracticeShadowingListPageV2";
import { ArrowForward } from "@mui/icons-material";
import { LessonCard, LessonCardSkeleton } from "./ShadowingLessonCard";

export function SectionRow({ title, items, isAllCategory, progressMap, onShowMore }: {
  title: string;
  items: ShadowingSummaryLesson[];
  isAllCategory: boolean;
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
        ) : isAllCategory ? items.slice(0,5).map(item => (
            <LessonCard key={item.id} item={item} progress={progressMap[item.id] || 0} />
          )) : items.map(item => (
            <LessonCard key={item.id} item={item} progress={progressMap[item.id] || 0} />
          ))}
      </div>
    </section>
  );
}

export function SectionSkeleton({
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