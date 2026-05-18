import { Card, Typography } from "@mui/material";
import {
  FastForward,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
} from "@mui/icons-material";
import {
  FlashcardCurrentOptionPreview,
  FlashcardCurrentPreview,
} from "../../types/flashcardPreview";
import { LegacyFlashcardEvalType } from "../../types/flashcardFeedback";

interface LegacyEvaluationSectionProps {
  onNext: (type: LegacyFlashcardEvalType) => void;
  currentPreview?: never;
  onSelectOption?: never;
}

interface PreviewEvaluationSectionProps {
  currentPreview: FlashcardCurrentPreview | null;
  onSelectOption: (option: FlashcardCurrentOptionPreview) => void;
  onNext?: never;
}

type EvaluationSectionProps =
  | LegacyEvaluationSectionProps
  | PreviewEvaluationSectionProps;

const previewHoverClassByKey: Record<
  FlashcardCurrentOptionPreview["key"],
  string
> = {
  remember: "hover:bg-green-50",
  vague: "hover:bg-yellow-50",
  unknown: "hover:bg-red-50",
  forgot: "hover:bg-red-50",
};

const previewIconByKey: Record<
  FlashcardCurrentOptionPreview["key"],
  JSX.Element
> = {
  remember: <SentimentSatisfied className="text-green-500 text-3xl" />,
  vague: <SentimentNeutral className="text-yellow-500 text-3xl" />,
  unknown: <SentimentDissatisfied className="text-red-500 text-3xl" />,
  forgot: <SentimentDissatisfied className="text-red-500 text-3xl" />,
};

export default function EvaluationSection(props: EvaluationSectionProps) {
  if ("currentPreview" in props) {
    if (!props.currentPreview) {
      return null;
    }

    return (
      <Card className="mt-6 p-3 overflow-x-auto">
        <div className="grid grid-cols-3 items-center gap-2 min-w-[520px] sm:min-w-0">
          {props.currentPreview.options.map((option) => (
            <div
              key={option.key}
              className={`flex min-w-0 flex-col items-center cursor-pointer rounded p-2 ${previewHoverClassByKey[option.key]}`}
              onClick={() => props.onSelectOption(option)}
            >
              {previewIconByKey[option.key]}

              <Typography variant="body2">
                {option.label}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                className="whitespace-nowrap text-[11px] sm:text-xs"
              >
                {option.preview}
              </Typography>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 p-3 flex justify-around items-center flex-wrap gap-2">
      <div
        className="flex flex-col items-center cursor-pointer hover:bg-green-50 p-2 rounded w-24"
        onClick={() => props.onNext("easy")}
      >
        <SentimentSatisfied className="text-green-500 text-3xl" />
        <Typography variant="body2">Dễ</Typography>
      </div>
      <div
        className="flex flex-col items-center cursor-pointer hover:bg-yellow-50 p-2 rounded w-24"
        onClick={() => props.onNext("medium")}
      >
        <SentimentNeutral className="text-yellow-500 text-3xl" />
        <Typography variant="body2">Trung bình</Typography>
      </div>
      <div
        className="flex flex-col items-center cursor-pointer hover:bg-red-50 p-2 rounded w-24"
        onClick={() => props.onNext("hard")}
      >
        <SentimentDissatisfied className="text-red-500 text-3xl" />
        <Typography variant="body2">Khó</Typography>
      </div>

      <div
        className="flex items-center cursor-pointer hover:bg-blue-50 p-2 rounded"
        onClick={() => props.onNext("skip")}
      >
        <FastForward className="text-blue-500 mr-1" />
        <Typography variant="body2">Đã biết, loại khỏi danh sách</Typography>
      </div>
    </Card>
  );
}
