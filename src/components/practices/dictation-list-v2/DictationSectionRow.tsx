import { Button, Skeleton } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { Dictation } from "../../../types/Dictation";
import { DictationCard } from "../DictationCard";

export function DictationSectionRow({
  title,
  items,
  canShowMore,
  onShowMore,
  onPickLesson,
}: {
  title: string;
  items: Dictation[];
  canShowMore: boolean;
  onShowMore: () => void;
  onPickLesson: (lesson: Dictation) => void;
}): JSX.Element {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button
          hidden={!canShowMore}
          endIcon={<ArrowForward />}
          onClick={onShowMore}
        >
          View more
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            Chưa có bài luyện tập
          </div>
        ) : (
          items.slice(0, 4).map((item) => (
            <DictationCard
              key={item._id}
              dictation={item}
              onClick={() => onPickLesson(item)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export function DictationSectionSkeleton({
  title,
}: {
  title: string;
}): JSX.Element {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
        <Skeleton variant="rounded" width={110} height={36} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={220} />
        ))}
      </div>
    </section>
  );
}
