import {
    CheckCircleOutline,
    Headphones,
    Mic,
    MenuBook,
    Hearing,
    Brush,
    LibraryBooks,
    VolumeUp,
    Description,
    EmojiEvents,
} from "@mui/icons-material";
import { ChatType, PracticeModeOption } from "../../../types/Chat";

export default function ChipScrollerMini({
    onChipClick,
}: {
    onChipClick?: (type: ChatType) => void;
}) {
    const QUESTION_TYPES: PracticeModeOption[] = [
        { value: "question", label: "Let’s practice short listening!", icon: CheckCircleOutline },
        { value: "reading", label: "Improve your reading flow!", icon: Headphones },
        { value: "dictation", label: "Train your dictation skill!", icon: Mic },
        { value: "shadowing", label: "Shadow my pronunciation!", icon: MenuBook },
        { value: "question", label: "Listen and guess the meaning!", icon: Hearing },
        { value: "lesson", label: "Quick TOEIC mini test", icon: Description },
        { value: "reading", label: "Read and find main ideas", icon: Brush },
        { value: "shadowing", label: "Repeat after me naturally", icon: LibraryBooks },
        { value: "dictation", label: "Can you write what you hear?", icon: VolumeUp },
        { value: "lesson", label: "Mock exam challenge", icon: EmojiEvents },
    ];

    const rows = [
        QUESTION_TYPES.slice(0, 4),
        QUESTION_TYPES.slice(4, 8),
        QUESTION_TYPES.slice(6, 10),
    ];

    return (
        <div className="space-y-3 w-full">
            {rows.map((row, i) => (
                <div key={i} className="relative overflow-hidden h-11">
                    <div
                        className={`inline-flex gap-3 h-full items-center whitespace-nowrap ${i % 2 === 1 ? "animate-scroll-reverse" : "animate-scroll-forward"
                            }`}
                    >
                        {[...row, ...row].map((type, index) => {
                            const Icon = type.icon;
                            return (
                                <div
                                    key={index}
                                    onClick={() => onChipClick?.(type.value)}
                                    className="flex-shrink-0 px-3.5 py-2 bg-gradient-to-br from-blue-500/10 to-blue-400/5 border border-blue-300/30 rounded-lg hover:border-blue-400/60 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2">
                                        {Icon && <Icon sx={{ width: 16, height: 16, color: "#1e40af" }} />}
                                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                                            {type.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
