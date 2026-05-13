import { useEffect, useMemo, useState } from "react";
import {
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAlt from "@mui/icons-material/RestartAlt";
import { useNavigate } from "react-router-dom";
import PracticeLayout from "../layouts/PracticeLayout";
import { dictationService } from "../../services/dictation.service";
import { Dictation } from "../../types/Dictation";
import {
  DictationSectionRow,
  DictationSectionSkeleton,
} from "../../components/practices/dictation-list-v2/DictationSectionRow";
import { DictationLessonSectionModal } from "../../components/practices/dictation-list-v2/DictationLessonSectionModal";
import {
  DictationPracticeStartModal,
  DictationDifficulty,
} from "../../components/practices/DictationPracticeStartModal";

type LevelFilter = "ALL" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type SectionKey = "inProgress" | "part1" | "part2" | "part3" | "part4";

type SectionMap = Record<SectionKey, Dictation[]>;

type SectionMetaMap = Record<Exclude<SectionKey, "inProgress">, number>;

const PARTS: Array<{ key: Exclude<SectionKey, "inProgress">; title: string; partType: number }> = [
  { key: "part1", title: "Part 1", partType: 1 },
  { key: "part2", title: "Part 2", partType: 2 },
  { key: "part3", title: "Part 3", partType: 3 },
  { key: "part4", title: "Part 4", partType: 4 },
];

export default function PracticeDictationListPageV2(): JSX.Element {
  const [sections, setSections] = useState<SectionMap>({
    inProgress: [],
    part1: [],
    part2: [],
    part3: [],
    part4: [],
  });
  const [sectionTotals, setSectionTotals] = useState<SectionMetaMap>({
    part1: 0,
    part2: 0,
    part3: 0,
    part4: 0,
  });
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");
  const [openSection, setOpenSection] = useState<Exclude<SectionKey, "inProgress"> | null>(null);
  const [selectedDictation, setSelectedDictation] = useState<Dictation | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DictationDifficulty>("easy");

  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        PARTS.map((part) =>
          dictationService.getAllDictationPage({
            part_type: part.partType,
            level: levelFilter === "ALL" ? undefined : levelFilter,
            limit: 4,
            page: 1,
          })
        )
      );

      const nextSections: SectionMap = {
        inProgress: [],
        part1: results[0].items,
        part2: results[1].items,
        part3: results[2].items,
        part4: results[3].items,
      };

      const nextTotals: SectionMetaMap = {
        part1: results[0].total,
        part2: results[1].total,
        part3: results[2].total,
        part4: results[3].total,
      };

      setSections(nextSections);
      setSectionTotals(nextTotals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    setOpenSection(null);
  }, [levelFilter]);

  const configs: Array<{ key: SectionKey; title: string; canShowMore: boolean }> = useMemo(() => {
    return [
      { key: "inProgress", title: "In Progress", canShowMore: false },
      ...PARTS.map((part) => ({
        key: part.key,
        title: part.title,
        canShowMore: sectionTotals[part.key] > 4,
      })),
    ];
  }, [sectionTotals]);

  const handlePickLesson = (lesson: Dictation) => {
    setSelectedDictation(lesson);
    setSelectedDifficulty("easy");
    setOpenSection(null);
  };

  const handleStartPractice = () => {
    if (!selectedDictation) return;

    navigate(
      `/practice-skill/dictation-v2/${selectedDictation._id}?difficulty=${selectedDifficulty}`
    );
    setSelectedDictation(null);
  };

  return (
    <PracticeLayout>
      <div className="min-h-screen p-4 md:p-8 text-slate-800">
        <div className="mb-8 space-y-6">
          <div className="relative flex justify-center">
            <div className="absolute left-0 top-0" onClick={handleBack}>
              <IconButton
                sx={{
                  backgroundColor: "#f1f5f9",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </div>

            <div className="text-center px-14">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
                Luyện nghe chép chính tả
              </h1>
              <p className="mt-2 text-slate-500">
                Luyện nghe chép chính tả theo từng Part
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col md:flex-row gap-5 w-full md:w-auto">
                <div className="min-w-[180px]">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cấp độ
                  </p>

                  <FormControl fullWidth size="small">
                    <Select
                      value={levelFilter}
                      onChange={(e) =>
                        setLevelFilter(e.target.value as LevelFilter)
                      }
                    >
                      <MenuItem value="ALL">Tất cả</MenuItem>
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

              <div className="flex justify-end">
                <Tooltip title="Reset Filter" arrow>
                  <IconButton
                    onClick={() => setLevelFilter("ALL")}
                    sx={{
                      width: 42,
                      height: 42,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      color: "#64748b",
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        borderColor: "#bfdbfe",
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

        {loading && (
          <div className="space-y-10">
            {configs.map((section) => (
              <DictationSectionSkeleton key={section.key} title={section.title} />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-10">
            {configs.map((section) => (
              <DictationSectionRow
                key={section.key}
                title={section.title}
                items={sections[section.key]}
                canShowMore={section.canShowMore}
                onShowMore={() => {
                  if (section.key !== "inProgress") {
                    setOpenSection(section.key);
                  }
                }}
                onPickLesson={handlePickLesson}
              />
            ))}
          </div>
        )}

        {openSection && (
          <DictationLessonSectionModal
            open={Boolean(openSection)}
            title={PARTS.find((part) => part.key === openSection)?.title || ""}
            partType={PARTS.find((part) => part.key === openSection)?.partType || 1}
            onClose={() => setOpenSection(null)}
            onPickLesson={handlePickLesson}
          />
        )}

        <DictationPracticeStartModal
          dictation={selectedDictation}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={setSelectedDifficulty}
          onClose={() => setSelectedDictation(null)}
          onStart={handleStartPractice}
        />
      </div>
    </PracticeLayout>
  );
}
