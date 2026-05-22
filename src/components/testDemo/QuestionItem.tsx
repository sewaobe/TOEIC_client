import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../stores/store";
import { setAnswer, toggleFlag } from "../../stores/answerSlice";

interface ChoiceOption {
  key: string;
  text: string;
}

interface QuestionItemProps {
  id: string;
  name: number;
  text: string;
  options: ChoiceOption[];
  showText?: boolean;
  choiceLabelMode?: "full" | "key-only";
}

const formatChoiceLabel = (
  { key, text }: ChoiceOption,
  mode: QuestionItemProps["choiceLabelMode"]
) => {
  if (mode === "key-only") return key;

  const trimmedText = text.trim();
  const startsWithKey = new RegExp(`^${key}[.)]\\s*`, "i").test(trimmedText);
  return startsWithKey ? trimmedText : `${key}. ${trimmedText}`;
};

const QuestionItem: React.FC<QuestionItemProps> = ({
  id,
  name,
  text,
  options,
  showText = true,
  choiceLabelMode = "full",
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const answer = useSelector(
    (state: RootState) =>
      state.answer.answers.find((ans) => ans.question === name) || {
        answer: "",
        isFlagged: false,
      }
  );

  const handleSelect = (optionKey: string) => {
    dispatch(setAnswer({ question: name, answer: optionKey }));
  };

  const handleToggleFlag = () => {
    dispatch(toggleFlag({ question: name }));
  };

  return (
    <div className="w-full md:w-1/2">
      <h3 className="font-bold mb-4">{name}.</h3>
      {showText && text && <p className="mb-4">{text}</p>}

      <ul className="space-y-2">
        {options.map((option) => (
          <li key={option.key}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`q${id}`}
                className="form-radio"
                checked={answer.answer === option.key}
                onChange={() => handleSelect(option.key)}
              />
              {formatChoiceLabel(option, choiceLabelMode)}
            </label>
          </li>
        ))}
      </ul>

      <button
        onClick={handleToggleFlag}
        className={`mt-3 px-3 py-1 rounded ${
          answer.isFlagged ? "bg-yellow-500 text-white" : "bg-gray-200"
        }`}
      >
        {answer.isFlagged ? "Bỏ gắn cờ" : "Gắn cờ"}
      </button>
    </div>
  );
};

export default QuestionItem;
