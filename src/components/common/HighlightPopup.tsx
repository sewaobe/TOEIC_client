import React, { useEffect, useMemo, useState } from "react";
import BookIcon from "@mui/icons-material/Book";
import StyleIcon from "@mui/icons-material/Style";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { dictionaryService } from "../../services/dictionary.service";
import type {
  CollocationEntry,
  DictionaryData,
  ExamplePair,
  SynonymMeaning,
  TranslatedDefinition,
  WordFamilyEntry,
} from "../../types/Dictionary";

type DictionaryTab = "meaning" | "phrases" | "examples" | "synonyms" | "family";

interface HighlightPopupProps {
  rect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
  text: string;
  onSaveNotebook: () => void;
  onSaveFlashcard: () => void;
  onAskAI: () => void;
  onClose: () => void;
  gap?: number;
}

interface DefinitionItem extends TranslatedDefinition {
  partOfSpeech: string;
}

const tabs: { key: DictionaryTab; label: string }[] = [
  { key: "meaning", label: "Nghĩa" },
  { key: "phrases", label: "Cụm từ" },
  { key: "examples", label: "Ví dụ" },
  { key: "synonyms", label: "Đồng nghĩa" },
  { key: "family", label: "Họ từ" },
];

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const playAudio = (audioUrl?: string) => {
  if (!audioUrl) return;
  void new Audio(audioUrl).play();
};

const getPopupPosition = (
  rect: HighlightPopupProps["rect"],
  gap: number,
) => {
  const width = Math.min(360, window.innerWidth - 24);
  const viewportTop = rect.top - window.scrollY;
  const viewportBottom = rect.bottom - window.scrollY;
  const preferredTop = viewportTop > 64 ? viewportTop - 48 : viewportBottom + gap;

  return {
    width,
    top: Math.max(12, Math.min(preferredTop, window.innerHeight - 120)),
    left: Math.max(12, Math.min(rect.left - width / 2, window.innerWidth - width - 12)),
  };
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="px-3 py-6 text-center text-xs text-slate-400">
    {label}
  </div>
);

const HighlightPopup: React.FC<HighlightPopupProps> = ({
  rect,
  text,
  onSaveNotebook,
  onSaveFlashcard,
  onAskAI,
  onClose,
  gap = 10,
}) => {
  const [activeTab, setActiveTab] = useState<DictionaryTab>("meaning");
  const [dictionary, setDictionary] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedText = useMemo(() => text.trim().replace(/\s+/g, " "), [text]);
  const position = getPopupPosition(rect, gap);

  useEffect(() => {
    if (!selectedText) return;

    let cancelled = false;
    setActiveTab("meaning");
    setDictionary(null);
    setError(null);
    setLoading(true);

    dictionaryService
      .lookup(selectedText)
      .then((data) => {
        if (!cancelled) setDictionary(data);
      })
      .catch((lookupError) => {
        console.error("Highlight dictionary lookup failed:", lookupError);
        if (!cancelled) setError("Chưa tra được nghĩa cho lựa chọn này.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedText]);

  const definitions = useMemo<DefinitionItem[]>(
    () =>
      dictionary?.translations.flatMap((entry) =>
        (entry.meanings?.length ? entry.meanings : entry.translatedDefinitions).map((definition) => ({
          ...definition,
          partOfSpeech: entry.partOfSpeech,
        })),
      ) ?? [],
    [dictionary],
  );

  const vietnameseDefinitions = useMemo(
    () => definitions.filter((definition) => definition.vi?.trim()),
    [definitions],
  );

  const examples = useMemo<ExamplePair[]>(
    () => [
      ...(dictionary?.examples ?? []),
      ...(dictionary?.translations.flatMap((entry) => entry.examples ?? []) ?? []),
    ],
    [dictionary],
  );

  const synonyms = useMemo<SynonymMeaning[]>(
    () => {
      const rootSynonyms = dictionary?.synonyms ?? [];
      const translationSynonyms = unique(
        dictionary?.translations.flatMap((entry) => entry.synonyms ?? []) ?? [],
      ).map((word) => ({ word, meaning: "" }));

      const seen = new Set<string>();
      return [...rootSynonyms, ...translationSynonyms].filter((synonym) => {
        const key = synonym.word.toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    [dictionary],
  );

  const collocations = useMemo<CollocationEntry[]>(
    () => dictionary?.collocations ?? [],
    [dictionary],
  );

  const wordFamily = useMemo<WordFamilyEntry[]>(
    () => dictionary?.word_family ?? [],
    [dictionary],
  );

  const phoneticLabel = useMemo(() => {
    if (!dictionary) return "";
    const uk = dictionary.phonetic_uk ? `UK ${dictionary.phonetic_uk}` : "";
    const us = dictionary.phonetic_us ? `US ${dictionary.phonetic_us}` : "";
    return [us, uk].filter(Boolean).join("  ");
  }, [dictionary]);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2 px-3 py-6 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-500" />
          Đang tra nghĩa...
        </div>
      );
    }

    if (error) {
      return <EmptyState label={error} />;
    }

    if (activeTab === "meaning") {
      if (!vietnameseDefinitions.length) return <EmptyState label="Chưa có nghĩa để hiển thị." />;

      return (
        <div className="space-y-2 px-3 py-3">
          {vietnameseDefinitions.slice(0, 4).map((definition, index) => (
            <div key={`${definition.partOfSpeech}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="mb-1 text-[11px] font-bold uppercase text-orange-500">
                {definition.partOfSpeech}
              </div>
              <div className="text-sm font-semibold leading-snug text-slate-800">
                {definition.vi}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "examples") {
      if (!examples.length) return <EmptyState label="Chưa có ví dụ cho lựa chọn này." />;

      return (
        <div className="space-y-2 px-3 py-3">
          {examples.slice(0, 4).map((example, index) => (
            <div key={`${example.en}-${index}`} className="rounded-lg border border-slate-100 px-3 py-2">
              <div className="text-xs italic leading-snug text-slate-700">{example.en}</div>
              {example.vi && <div className="mt-1 text-xs leading-snug text-slate-500">{example.vi}</div>}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "synonyms") {
      if (!synonyms.length) return <EmptyState label="Chưa có từ đồng nghĩa." />;

      return (
        <div className="space-y-2 px-3 py-3">
          {synonyms.slice(0, 12).map((synonym) => (
            <div key={synonym.word} className="rounded-lg border border-slate-100 px-3 py-2">
              <div className="text-xs font-semibold text-slate-800">{synonym.word}</div>
              {synonym.meaning && <div className="mt-0.5 text-xs text-slate-500">{synonym.meaning}</div>}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "phrases") {
      if (!collocations.length) return <EmptyState label="Chưa có cụm từ." />;

      return (
        <div className="space-y-2 px-3 py-3">
          {collocations.slice(0, 8).map((item) => (
            <div key={item.phrase} className="rounded-lg border border-slate-100 px-3 py-2">
              <div className="text-xs font-semibold text-slate-800">{item.phrase}</div>
              {item.meaning && <div className="mt-0.5 text-xs text-slate-500">{item.meaning}</div>}
            </div>
          ))}
        </div>
      );
    }

    if (!wordFamily.length) return <EmptyState label="Chưa có họ từ." />;

    return (
      <div className="flex flex-wrap gap-2 px-3 py-3">
        {wordFamily.slice(0, 10).map((item) => (
          <span key={`${item.word}-${item.partOfSpeech}`} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
            {item.word}
            {item.partOfSpeech && <span className="ml-1 text-slate-400">({item.partOfSpeech})</span>}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      className="fixed z-[3000] flex flex-col items-start gap-2"
      onMouseDown={(event) => event.preventDefault()}
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      <div
        role="toolbar"
        className="
          flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg
          divide-x divide-gray-200
        "
      >
        <button
          onClick={onSaveNotebook}
          className="relative group flex items-center gap-1 px-3 py-2 hover:bg-gray-50"
          aria-label="Save to Notebook"
        >
          <BookIcon fontSize="small" className="text-indigo-600" />
          <span className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
            Notebook
          </span>
        </button>

        <button
          onClick={onSaveFlashcard}
          className="relative group flex items-center gap-1 px-3 py-2 hover:bg-gray-50"
          aria-label="Save to Flashcard"
        >
          <StyleIcon fontSize="small" className="text-rose-600" />
          <span className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
            Flashcard
          </span>
        </button>

        <button
          onClick={onAskAI}
          className="relative group flex items-center gap-1 px-3 py-2 hover:bg-gray-50"
          aria-label="Ask AI"
        >
          <SmartToyIcon fontSize="small" className="text-blue-600" />
          <span className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
            Ask AI
          </span>
        </button>
      </div>

      <div className="max-h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-slate-800" title={selectedText}>
              {selectedText}
            </div>
            {(dictionary?.phonetic || phoneticLabel) && (
              <div className="mt-0.5 text-xs text-slate-400">
                {phoneticLabel || dictionary?.phonetic}
              </div>
            )}
            {(dictionary?.audio_us || dictionary?.audio_uk) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dictionary.audio_us && (
                  <button
                    type="button"
                    onClick={() => playAudio(dictionary.audio_us)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <VolumeUpIcon sx={{ fontSize: 12 }} />
                    US
                  </button>
                )}
                {dictionary.audio_uk && (
                  <button
                    type="button"
                    onClick={() => playAudio(dictionary.audio_uk)}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <VolumeUpIcon sx={{ fontSize: 12 }} />
                    UK
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                dictionary?.cached
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-sky-50 text-sky-500"
              }`}
              title={dictionary?.model || dictionary?.metadata?.source || undefined}
            >
              {dictionary?.cached ? "CACHE" : "AI-VI"}
            </span>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close highlight dictionary"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="flex border-y border-slate-100 bg-slate-50/80">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-2 py-2 text-[11px] font-semibold ${
                activeTab === tab.key ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
          <input type="checkbox" checked readOnly className="h-3.5 w-3.5 accent-sky-500" />
          Kèm ví dụ khi thêm từ
        </label>

        <button
          onClick={onSaveFlashcard}
          className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-xl border border-dashed border-sky-200 px-3 py-2 text-xs font-semibold text-sky-500 hover:bg-sky-50"
        >
          <span className="flex items-center gap-2">
            <EditIcon fontSize="small" />
            Thêm nghĩa riêng của bạn
          </span>
          <AddIcon fontSize="small" />
        </button>

        <div className="max-h-56 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default HighlightPopup;
