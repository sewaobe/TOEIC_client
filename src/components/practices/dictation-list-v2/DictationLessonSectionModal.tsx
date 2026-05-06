import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Slide,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { Dictation } from "../../../types/Dictation";
import { dictationService } from "../../../services/dictation.service";
import { DictationCard } from "../DictationCard";
import { toeicPartsArray } from "../../../constants/toeicPart";

export type DictationLevel = "ALL" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type DictationLessonSectionModalProps = {
  open: boolean;
  title: string;
  partType: number;
  onClose: () => void;
  onPickLesson: (lesson: Dictation) => void;
};

export function DictationLessonSectionModal({
  open,
  title,
  partType,
  onClose,
  onPickLesson,
}: DictationLessonSectionModalProps): JSX.Element {
  const [items, setItems] = useState<Dictation[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const inFlightPagesRef = useRef<Set<number>>(new Set());
  const [levelFilter, setLevelFilter] = useState<DictationLevel>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");
  const partTags = useMemo(() => {
    const part = toeicPartsArray[partType - 1];
    return part?.tags || [];
  }, [partType]);

  useEffect(() => {
    if (!open) {
      setLevelFilter("ALL");
      setTagFilter("ALL");
      setItems([]);
      setPage(1);
      setHasMore(true);
    }
  }, [open]);

  const fetchPage = async (pageToLoad: number, mode: "replace" | "append") => {
    if (inFlightPagesRef.current.has(pageToLoad)) {
      return;
    }

    setIsLoading(true);
    try {
      inFlightPagesRef.current.add(pageToLoad);
      const data = await dictationService.getAllDictationPage({
        part_type: partType,
        level: levelFilter === "ALL" ? undefined : levelFilter,
        limit: 20,
        page: pageToLoad,
      });

      const nextItems = mode === "replace" ? data.items : [...items, ...data.items];
      setItems(nextItems);
      setPage(pageToLoad);
      setHasMore(pageToLoad < data.pageCount);
    } finally {
      inFlightPagesRef.current.delete(pageToLoad);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchPage(1, "replace");
  }, [open, partType, levelFilter]);

  const finalItems = useMemo(() => {
    let data = [...items];

    if (tagFilter !== "ALL") {
      data = data.filter((item) => item.tags?.includes(tagFilter));
    }

    return data;
  }, [items, tagFilter]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (isLoading || !hasMore || items.length < 15) {
      return;
    }

    const target = event.currentTarget;
    const remaining = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remaining < 200) {
      fetchPage(page + 1, "append");
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
        transition: { direction: "up" },
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {finalItems.length} bài luyện tập
          </p>
        </div>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent onScroll={handleScroll}>
        <div className="mb-5 flex flex-col sticky top-0 z-10 bg-white md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-3 flex-col sm:flex-row">
            <FormControl size="small">
              <Select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value as DictationLevel)
                }
              >
                <MenuItem value="ALL">Tất cả cấp độ</MenuItem>
                <MenuItem value="A1">A1</MenuItem>
                <MenuItem value="A2">A2</MenuItem>
                <MenuItem value="B1">B1</MenuItem>
                <MenuItem value="B2">B2</MenuItem>
                <MenuItem value="C1">C1</MenuItem>
                <MenuItem value="C2">C2</MenuItem>
              </Select>
            </FormControl>

              <FormControl size="small">
                <Select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                >
                  <MenuItem value="ALL">Tất cả tags</MenuItem>
                  {partTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-1">
          {finalItems.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              Chưa có bài luyện tập
            </div>
          ) : (
            finalItems.map((item) => (
              <DictationCard
                key={item._id}
                dictation={item}
                onClick={() => onPickLesson(item)}
              />
            ))
          )}
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
